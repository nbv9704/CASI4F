const Joi = require('joi');

const socialLink = Joi.string().trim().allow('').max(200);

const updateProfileSchema = Joi.object({
  bio: Joi.string().trim().allow('').max(300),
  statusState: Joi.string().valid('online', 'offline', 'busy', 'idle'),
  statusMessage: Joi.string().trim().allow('').max(140),
  statusMessageDurationMinutes: Joi.number()
    .integer()
    .min(5)
    .max(1440)
    .allow(null),
  profileVisibility: Joi.string().valid('public', 'friends', 'private'),
  activeBadge: Joi.string().trim().uppercase().allow(null, ''),
  socialLinks: Joi.object({
    discord: socialLink,
    twitter: socialLink,
    twitch: socialLink,
    youtube: socialLink,
  }).optional(),
  achievementShowcase: Joi.array()
    .items(Joi.string().trim().uppercase())
    .max(3)
    .unique()
    .optional(),
}).min(1);

module.exports = {
  updateProfileSchema,
};
