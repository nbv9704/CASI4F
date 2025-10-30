// server/utils/validateEnv.js
const Joi = require('joi');

/**
 * Environment variable validation schema
 * Defines required and optional environment variables with their validation rules
 */
const envSchema = Joi.object({
  // ===== REQUIRED Variables =====
  
  // MongoDB connection string (required)
  MONGO_URI: Joi.string()
    .uri()
    .required()
    .description('MongoDB connection string')
    .messages({
      'string.uri': 'MONGO_URI must be a valid MongoDB connection string',
      'any.required': 'MONGO_URI is required - please set your MongoDB connection string'
    }),

  // JWT secret for authentication (required)
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret key for token signing')
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters long for security',
      'any.required': 'JWT_SECRET is required - generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    }),

  // ===== OPTIONAL Variables with Defaults =====

  // Server configuration
  PORT: Joi.number()
    .port()
    .default(3001)
    .description('Server port number'),

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Node environment'),

  // CORS configuration
  CLIENT_URL: Joi.string()
    .uri()
    .allow('')
    .default('http://localhost:3000')
    .description('Frontend client URL for CORS'),

  FRONTEND_URL: Joi.string()
    .uri()
    .allow('')
    .default('http://localhost:3000')
    .description('Alternative frontend URL for CORS'),

  // Session configuration
  SESSION_SECRET: Joi.string()
    .min(16)
    .default(() => require('crypto').randomBytes(32).toString('hex'))
    .description('Session secret for cookie-parser'),

  // Rate limiting
  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Maximum requests per rate limit window'),

  RATE_LIMIT_WINDOW: Joi.number()
    .integer()
    .min(1)
    .default(15)
    .description('Rate limit time window in minutes'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info')
    .description('Application log level'),

  HTTP_LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'none')
    .default('info')
    .description('HTTP request log level'),

  HTTP_LOG_IGNORE_PATHS: Joi.string()
    .allow('')
    .default('/api/admin/pvp/health')
    .description('Comma-separated paths to ignore in HTTP logs'),

  // Game configuration
  MIN_BET_AMOUNT: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('Minimum bet amount'),

  MAX_BET_AMOUNT: Joi.number()
    .integer()
    .min(1)
    .default(10000)
    .description('Maximum bet amount'),

  // Reward configuration
  HOURLY_REWARD: Joi.number()
    .integer()
    .min(0)
    .default(50)
    .description('Hourly reward amount'),

  DAILY_REWARD: Joi.number()
    .integer()
    .min(0)
    .default(500)
    .description('Daily reward amount'),

  WEEKLY_REWARD: Joi.number()
    .integer()
    .min(0)
    .default(5000)
    .description('Weekly reward amount'),

  // PvP configuration
  PVP_CLEANUP_INTERVAL: Joi.number()
    .integer()
    .min(1)
    .default(5)
    .description('PvP room cleanup interval in minutes'),

  PVP_ROOM_TIMEOUT: Joi.number()
    .integer()
    .min(1)
    .default(30)
    .description('PvP room timeout in minutes'),

  PVP_SWEEP_INTERVAL_MS: Joi.number()
    .integer()
    .min(1000)
    .default(60000)
    .description('PvP sweep interval in milliseconds'),

  PVP_MAX_WAITING_AGE_MS: Joi.number()
    .integer()
    .min(1000)
    .default(1800000)
    .description('Maximum waiting age for PvP rooms in milliseconds'),

  PVP_COINFLIP_GRACE_MS: Joi.number()
    .integer()
    .min(0)
    .default(10000)
    .description('Coinflip grace period in milliseconds'),

  PVP_DICE_GRACE_MS: Joi.number()
    .integer()
    .min(0)
    .default(4000)
    .description('Dice grace period in milliseconds'),

  PVP_DICE_IDLE_MS: Joi.number()
    .integer()
    .min(1000)
    .default(60000)
    .description('Dice idle timeout in milliseconds'),

  PVP_DICE_UNSTARTED_REFUND_MS: Joi.number()
    .integer()
    .min(1000)
    .default(900000)
    .description('Unstarted dice refund timeout in milliseconds'),

  PVP_CRON_LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'none')
    .default('error')
    .description('PvP cron job log level'),

  PVP_CRON_FILE_LOG: Joi.string()
    .valid('0', '1', 'true', 'false')
    .default('0')
    .description('Enable PvP cron file logging'),

  PVP_CRON_LOG_DIR: Joi.string()
    .default('./logs')
    .description('PvP cron log directory'),

  PVP_CRON_LOG_MAX_MB: Joi.number()
    .integer()
    .min(1)
    .default(10)
    .description('Maximum PvP cron log file size in MB'),

}).unknown(true); // Allow unknown variables (for system env vars)

/**
 * Validate environment variables
 * @throws {Error} If validation fails
 * @returns {Object} Validated and sanitized environment variables
 */
function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Show all errors, not just the first
    stripUnknown: false, // Keep unknown variables
  });

  if (error) {
    const errorMessages = error.details.map((detail) => {
      return `  ❌ ${detail.message}`;
    });

    console.error('\n🚨 Environment Variable Validation Failed:\n');
    console.error(errorMessages.join('\n'));
    console.error('\n💡 Please check your .env file or set the required environment variables.');
    console.error('📄 See .env.example for reference.\n');
    
    throw new Error('Environment validation failed');
  }

  // Log successful validation in development
  if (value.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully');
    console.log(`📍 Environment: ${value.NODE_ENV}`);
    console.log(`🔌 MongoDB: ${value.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    console.log(`🔑 JWT Secret: ${value.JWT_SECRET.substring(0, 8)}...`);
    console.log(`🌐 Port: ${value.PORT}`);
  }

  return value;
}

module.exports = validateEnv;
