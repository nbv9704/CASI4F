# Conversation Progress Summary

_Last updated: 2025-11-12_

## Admin Dashboard
- Reset error state before retrying `/admin/dashboard` fetches so successful reloads render stats instead of the error screen.
- Prevent the "access denied" placeholder from flashing while the user context is still loading and ensure the "new today" badge reflects `stats.newUsersToday`.

## Higher/Lower Solo Game
- Backend `stopHigherLower` controller now resets `higherLowerLastNumber` to the default (10) when ending a streak.
- Frontend stop handler always restores the current number to 10 after a streak is halted, even if the API omits the value.

## Notification Bell & Collections
- Daily reward reminder notifications no longer trigger PvP join calls; instead they open `/rewards` cleanly and the redundant "Refresh" button was removed, leaving more space for the remaining actions.
- Footer buttons in the notification dropdown use a smaller font size for better balance.
- Achievement notifications always navigate to the Collections hub, regardless of legacy links.

## Achievements & Collections
- Level-based achievement milestone links in `achievementMilestones.js` were updated from `/profile/customize` to `/collections` for consistency with the bell routing.

## Daily Reward Reminder System
- Added per-user timezone support (stored on the `User` model and updatable via the profile patch route) and refactored the reminder cron to schedule one notification per local day at the user’s midnight.
- Introduced Luxon for timezone math and ensured reminder notifications include metadata pointing to `/rewards`.
- Installed the new `luxon` dependency in the server project (`npm install`).

## Notes & Next Steps
- Restart the server (or rerun `npm run dev` in `server/`) after pulling these updates.
- Consider adding a UI control for users to adjust their timezone if needed.
