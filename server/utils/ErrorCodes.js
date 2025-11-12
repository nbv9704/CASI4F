// server/utils/ErrorCodes.js

/**
 * Centralized error codes for consistent error handling across the application.
 * Format: CATEGORY_SPECIFIC_ERROR
 */

const ErrorCodes = {
  // === AUTHENTICATION & AUTHORIZATION ===
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID_USER_ID: 'AUTH_TOKEN_INVALID_USER_ID',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_EXISTS: 'AUTH_USER_EXISTS',

  // === USER ERRORS ===
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_DUPLICATE_USERNAME: 'USER_DUPLICATE_USERNAME',
  USER_DUPLICATE_EMAIL: 'USER_DUPLICATE_EMAIL',
  USER_INVALID_PASSWORD: 'USER_INVALID_PASSWORD',

  // === PROFILE ===
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_NOT_VISIBLE: 'PROFILE_NOT_VISIBLE',
  PROFILE_BADGE_NOT_OWNED: 'PROFILE_BADGE_NOT_OWNED',
  PROFILE_ACHIEVEMENT_NOT_UNLOCKED: 'PROFILE_ACHIEVEMENT_NOT_UNLOCKED',
  PROFILE_SHOWCASE_LIMIT: 'PROFILE_SHOWCASE_LIMIT',
  PROFILE_SHOWCASE_DUPLICATE: 'PROFILE_SHOWCASE_DUPLICATE',
  PROFILE_SOCIAL_LINK_INVALID: 'PROFILE_SOCIAL_LINK_INVALID',

  // === WALLET & BALANCE ===
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_BANK_BALANCE: 'INSUFFICIENT_BANK_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_TRANSFER_DATA: 'INVALID_TRANSFER_DATA',

  // === PVP ROOM ERRORS ===
  PVP_ROOM_NOT_FOUND: 'PVP_ROOM_NOT_FOUND',
  PVP_ROOM_NOT_JOINABLE: 'PVP_ROOM_NOT_JOINABLE',
  PVP_ROOM_NOT_READYABLE: 'PVP_ROOM_NOT_READYABLE',
  PVP_ROOM_NOT_ACTIVE: 'PVP_ROOM_NOT_ACTIVE',
  PVP_ROOM_ALREADY_ACTIVE: 'PVP_ROOM_ALREADY_ACTIVE',
  PVP_ROOM_NOT_WAITING: 'PVP_ROOM_NOT_WAITING',
  PVP_ROOM_FULL: 'PVP_ROOM_FULL',
  PVP_ROOM_NOT_FINISHED: 'PVP_ROOM_NOT_FINISHED',

  // === PVP PERMISSIONS ===
  PVP_NOT_MEMBER: 'PVP_NOT_MEMBER',
  PVP_ONLY_OWNER: 'PVP_ONLY_OWNER',
  PVP_NOT_YOUR_TURN: 'PVP_NOT_YOUR_TURN',

  // === PVP GAME LOGIC ===
  PVP_NEED_AT_LEAST_2_PLAYERS: 'PVP_NEED_AT_LEAST_2_PLAYERS',
  PVP_ALL_PARTICIPANTS_MUST_READY: 'PVP_ALL_PARTICIPANTS_MUST_READY',
  PVP_TURN_ORDER_NOT_INITIALIZED: 'PVP_TURN_ORDER_NOT_INITIALIZED',
  PVP_ROLL_PENDING: 'PVP_ROLL_PENDING',
  PVP_NOT_DICE_ROOM: 'PVP_NOT_DICE_ROOM',
  PVP_NOT_COINFLIP_ROOM: 'PVP_NOT_COINFLIP_ROOM',

  // === INPUT VALIDATION ===
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_USER_ID: 'INVALID_USER_ID',
  INVALID_OBJECT_ID: 'INVALID_OBJECT_ID',
  MISSING_PARAMETER: 'MISSING_PARAMETER',

  // === SOCIAL / FRIENDS ===
  FRIEND_SELF_REQUEST: 'FRIEND_SELF_REQUEST',
  FRIEND_ALREADY_REQUESTED: 'FRIEND_ALREADY_REQUESTED',
  FRIEND_ALREADY_EXISTS: 'FRIEND_ALREADY_EXISTS',
  FRIEND_REQUEST_NOT_FOUND: 'FRIEND_REQUEST_NOT_FOUND',
  FRIEND_NOT_FOUND: 'FRIEND_NOT_FOUND',
  FRIEND_INVALID_TARGET: 'FRIEND_INVALID_TARGET',
  CHAT_MESSAGE_EMPTY: 'CHAT_MESSAGE_EMPTY',
  CHAT_MESSAGE_TOO_LONG: 'CHAT_MESSAGE_TOO_LONG',
  CHAT_NOT_ALLOWED: 'CHAT_NOT_ALLOWED',

  // === RATE LIMITING ===
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_AUTH: 'RATE_LIMIT_AUTH',
  RATE_LIMIT_TRANSFER: 'RATE_LIMIT_TRANSFER',
  RATE_LIMIT_PVP: 'RATE_LIMIT_PVP',
  RATE_LIMIT_GAME: 'RATE_LIMIT_GAME',
  RATE_LIMIT_CREATE_ROOM: 'RATE_LIMIT_CREATE_ROOM',

  // === GENERIC ===
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
};

// Human-readable messages for each error code (Vietnamese)
const ErrorMessages = {
  [ErrorCodes.AUTH_TOKEN_MISSING]: 'Không tìm thấy token xác thực',
  [ErrorCodes.AUTH_TOKEN_INVALID]: 'Token xác thực không hợp lệ',
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 'Token xác thực đã hết hạn',
  [ErrorCodes.AUTH_TOKEN_INVALID_USER_ID]: 'Token xác thực không hợp lệ',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không đúng',
  [ErrorCodes.AUTH_USER_EXISTS]: 'Tài khoản đã tồn tại',

  [ErrorCodes.USER_NOT_FOUND]: 'Không tìm thấy người dùng',
  [ErrorCodes.USER_DUPLICATE_USERNAME]: 'Tên người dùng đã tồn tại',
  [ErrorCodes.USER_DUPLICATE_EMAIL]: 'Email đã được sử dụng',
  [ErrorCodes.USER_INVALID_PASSWORD]: 'Mật khẩu không đúng',

  [ErrorCodes.PROFILE_NOT_FOUND]: 'Không tìm thấy hồ sơ người chơi',
  [ErrorCodes.PROFILE_NOT_VISIBLE]: 'Hồ sơ này đang được đặt ở chế độ riêng tư',
  [ErrorCodes.PROFILE_BADGE_NOT_OWNED]: 'Bạn chưa sở hữu huy hiệu này',
  [ErrorCodes.PROFILE_ACHIEVEMENT_NOT_UNLOCKED]: 'Bạn chưa mở khóa thành tựu này',
  [ErrorCodes.PROFILE_SHOWCASE_LIMIT]: 'Bạn chỉ có thể ghim tối đa 3 thành tựu',
  [ErrorCodes.PROFILE_SHOWCASE_DUPLICATE]: 'Thành tựu được ghim không được trùng nhau',
  [ErrorCodes.PROFILE_SOCIAL_LINK_INVALID]: 'Liên kết mạng xã hội không hợp lệ',

  [ErrorCodes.INSUFFICIENT_BALANCE]: 'Số dư không đủ',
  [ErrorCodes.INSUFFICIENT_BANK_BALANCE]: 'Số dư ngân hàng không đủ',
  [ErrorCodes.INVALID_AMOUNT]: 'Số tiền không hợp lệ',
  [ErrorCodes.INVALID_TRANSFER_DATA]: 'Dữ liệu chuyển tiền không hợp lệ',

  [ErrorCodes.PVP_ROOM_NOT_FOUND]: 'Không tìm thấy phòng',
  [ErrorCodes.PVP_ROOM_NOT_JOINABLE]: 'Không thể tham gia phòng này',
  [ErrorCodes.PVP_ROOM_FULL]: 'Phòng đã đầy',
  [ErrorCodes.PVP_NOT_MEMBER]: 'Bạn không phải thành viên của phòng',
  [ErrorCodes.PVP_ONLY_OWNER]: 'Chỉ chủ phòng mới có quyền thực hiện',
  [ErrorCodes.PVP_NOT_YOUR_TURN]: 'Chưa đến lượt của bạn',

  [ErrorCodes.INVALID_INPUT]: 'Dữ liệu đầu vào không hợp lệ',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  [ErrorCodes.INTERNAL_ERROR]: 'Lỗi hệ thống, vui lòng thử lại sau',

  [ErrorCodes.FRIEND_SELF_REQUEST]: 'Bạn không thể kết bạn với chính mình',
  [ErrorCodes.FRIEND_ALREADY_REQUESTED]: 'Yêu cầu kết bạn đã được gửi trước đó',
  [ErrorCodes.FRIEND_ALREADY_EXISTS]: 'Hai bạn đã là bạn bè',
  [ErrorCodes.FRIEND_REQUEST_NOT_FOUND]: 'Không tìm thấy yêu cầu kết bạn',
  [ErrorCodes.FRIEND_NOT_FOUND]: 'Không tìm thấy người dùng mục tiêu',
  [ErrorCodes.FRIEND_INVALID_TARGET]: 'Không thể xử lý người dùng này',
  [ErrorCodes.CHAT_MESSAGE_EMPTY]: 'Tin nhắn không được để trống',
  [ErrorCodes.CHAT_MESSAGE_TOO_LONG]: 'Tin nhắn quá dài',
  [ErrorCodes.CHAT_NOT_ALLOWED]: 'Bạn không thể nhắn tin cho người này',
};

module.exports = {
  ErrorCodes,
  ErrorMessages,
};