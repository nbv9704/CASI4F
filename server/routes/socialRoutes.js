const express = require('express')

const auth = require('../middleware/auth')
const { listFriends, sendFriendRequest, respondFriendRequest, removeFriend } = require('../controllers/friendController')
const { listMessages, sendMessage } = require('../controllers/messageController')

const router = express.Router()

router.use(auth)

router.get('/friends', listFriends)
router.post('/friends', ...sendFriendRequest)
router.post('/friends/:id/respond', ...respondFriendRequest)
router.delete('/friends/:friendId', removeFriend)

router.get('/messages/:friendId', ...listMessages)
router.post('/messages/:friendId', ...sendMessage)

module.exports = router
