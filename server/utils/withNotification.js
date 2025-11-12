// server/utils/withNotification.js
const { pushNotification } = require('./notify')
const { sendAchievementNotifications } = require('./achievements')

/**
 * Wrap controller để tự động push notification khi payload có { win, amount }
 * Response và notification được gửi ngay lập tức (no delay)
 */
function withNotification(controller, gameName) {
  return async (req, res, next) => {
    // giữ lại phương thức json gốc
    const originalJson = res.json.bind(res)

    // override
    res.json = (payload) => {
      // 1) gửi response cho client ngay
      originalJson(payload)

      // 2) nếu đúng shape, push notification ngay lập tức
      if (
        payload &&
        typeof payload.win === 'boolean' &&
        typeof payload.amount === 'number'
      ) {
        const type    = payload.win ? 'game_win' : 'game_loss'
        const message = payload.win
          ? `You won ${payload.amount} on ${gameName}`
          : `You lost ${payload.amount} on ${gameName}`

        // Fire-and-forget notification (no delay)
        pushNotification(req.app, req.user.id, type, message)
          .catch(err => console.error('Notification error:', err))
      }

      if (payload?.experience?.leveledUp) {
        const level = payload.experience.level ?? 'mới'
        pushNotification(
          req.app,
          req.user.id,
          'level_up',
          `Chúc mừng! Bạn đã đạt cấp ${level}.`
        ).catch(err => console.error('Level-up notification error:', err))
      }

      const unlockedAchievements =
        payload?.experience?.achievementsUnlocked?.length
          ? payload.experience.achievementsUnlocked
          : payload?.achievementsUnlocked;

      if (unlockedAchievements?.length) {
        sendAchievementNotifications(
          req.app,
          req.user.id,
          unlockedAchievements
        )
      }
    }

    // gọi controller gốc
    return controller(req, res, next)
  }
}

module.exports = withNotification
