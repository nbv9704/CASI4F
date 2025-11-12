const User = require('../models/User')
const { pushNotification } = require('../utils/notify')
const { DateTime } = require('luxon')

const DEFAULT_INTERVAL_MS = Number(process.env.DAILY_REWARD_REMINDER_INTERVAL_MS || 60 * 1000)
const BATCH_LIMIT = Number(process.env.DAILY_REWARD_REMINDER_BATCH_LIMIT || 100)
const DEFAULT_USER_TIMEZONE = process.env.DEFAULT_USER_TIMEZONE || 'Asia/Ho_Chi_Minh'
const FALLBACK_TIMEZONE = 'UTC'
const LOOKAHEAD_MINUTES = Number(process.env.DAILY_REWARD_REMINDER_LOOKAHEAD_MINUTES || 2)
const MIN_ACCOUNT_AGE_MS = Number(process.env.DAILY_REWARD_REMINDER_MIN_ACCOUNT_AGE_MS || 6 * 60 * 60 * 1000)

let reminderTimer = null
let isRunning = false

const timezoneCache = new Map()

function resolveTimeZone(user) {
  const raw = typeof user?.timeZone === 'string' && user.timeZone.trim() ? user.timeZone.trim() : DEFAULT_USER_TIMEZONE
  if (timezoneCache.has(raw)) return timezoneCache.get(raw)
  const probe = DateTime.now().setZone(raw)
  const resolved = probe.isValid ? raw : FALLBACK_TIMEZONE
  timezoneCache.set(raw, resolved)
  return resolved
}

function computeNextMidnight(afterUtc, timeZone) {
  return afterUtc.setZone(timeZone).plus({ days: 1 }).startOf('day').toUTC()
}

async function runReminderSweep(app) {
  if (!app || isRunning) return
  isRunning = true

  try {
    const nowUtc = DateTime.utc()
    const dueWindowUtc = nowUtc.plus({ minutes: LOOKAHEAD_MINUTES })
    const accountAgeCutoff = nowUtc.minus({ milliseconds: MIN_ACCOUNT_AGE_MS }).toJSDate()

    const candidates = await User.find({
      createdAt: { $lte: accountAgeCutoff },
      $or: [
        { 'notificationFlags.dailyReminderNextAt': { $exists: false } },
        { 'notificationFlags.dailyReminderNextAt': { $lte: dueWindowUtc.toJSDate() } },
      ],
    })
      .select('_id username timeZone dailyCollectedAt notificationFlags')
      .limit(BATCH_LIMIT)
      .lean()

    if (!candidates.length) return

    const updates = []

    await Promise.all(
      candidates.map(async (doc) => {
        const timeZone = resolveTimeZone(doc)
        const flags = doc.notificationFlags || {}
        const scheduledUtc = flags.dailyReminderNextAt
          ? DateTime.fromJSDate(flags.dailyReminderNextAt, { zone: 'utc' })
          : null

        if (!scheduledUtc) {
          const nextAt = computeNextMidnight(nowUtc, timeZone)
          updates.push(
            User.updateOne(
              { _id: doc._id },
              { $set: { 'notificationFlags.dailyReminderNextAt': nextAt.toJSDate() } }
            )
          )
          return
        }

        if (scheduledUtc > dueWindowUtc) {
          return
        }

        if (scheduledUtc > nowUtc) {
          return
        }

  const localNow = nowUtc.setZone(timeZone)
        const startOfDay = localNow.startOf('day')
  const nextSchedule = computeNextMidnight(nowUtc, timeZone)

        const collectedAt = doc.dailyCollectedAt
          ? DateTime.fromJSDate(doc.dailyCollectedAt, { zone: 'utc' }).setZone(timeZone)
          : null

        if (collectedAt && collectedAt >= startOfDay) {
          updates.push(
            User.updateOne(
              { _id: doc._id },
              {
                $set: {
                  'notificationFlags.dailyReminderNextAt': nextSchedule.toJSDate(),
                },
              }
            )
          )
          return
        }

        try {
          const message = `${doc.username || 'Bạn'} ơi, đừng quên nhận thưởng hằng ngày tại CASI4F nhé!`
          await pushNotification(app, doc._id, 'reward_reminder', message, {
            link: '/rewards',
            metadata: {
              type: 'daily_reward',
              path: '/rewards',
            },
          })
        } catch (error) {
          console.error('Daily reward reminder notification error:', error)
        }

        updates.push(
          User.updateOne(
            { _id: doc._id },
            {
              $set: {
                'notificationFlags.lastDailyRewardReminderAt': nowUtc.toJSDate(),
                'notificationFlags.dailyReminderNextAt': nextSchedule.toJSDate(),
              },
            }
          )
        )
      })
    )

    if (updates.length) {
      await Promise.allSettled(updates)
    }
  } catch (error) {
    console.error('Daily reward reminder sweep error:', error)
  } finally {
    isRunning = false
  }
}

function scheduleDailyRewardReminder(app) {
  if (!app) return () => {}
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }

  const run = () => runReminderSweep(app)
  reminderTimer = setInterval(run, DEFAULT_INTERVAL_MS)
  run().catch((error) => console.error('Daily reward reminder initial sweep error:', error))

  return () => stopDailyRewardReminder()
}

function stopDailyRewardReminder() {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

module.exports = {
  scheduleDailyRewardReminder,
  stopDailyRewardReminder,
}
