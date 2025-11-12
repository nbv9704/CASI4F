const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const optionalAuth = require('../middleware/optionalAuth');
const { updateProfileSchema } = require('../validation/profileSchemas');
const profileController = require('../controllers/profileController');

router.get('/me', auth, asyncHandler(profileController.getMyProfile));

router.patch(
  '/me',
  auth,
  validateRequest(updateProfileSchema, 'body'),
  asyncHandler(profileController.updateMyProfile)
);

router.get(
  '/public/:username',
  optionalAuth,
  asyncHandler(profileController.getPublicProfile)
);

module.exports = router;
