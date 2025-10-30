// server/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/AppError');
const { ErrorCodes, ErrorMessages } = require('../utils/ErrorCodes');
const { transferLimiter } = require('../middleware/rateLimitStrict');

// ✅ Import validation schemas
const { depositSchema, withdrawSchema, transferSchema } = require('../validation/walletSchemas');

// Helper: create & emit notification
async function pushNotification(req, userId, type, message) {
  const notif = await Notification.create({ userId, type, message });
  const io = req.app.get('io');
  const onlineUsers = req.app.get('onlineUsers');
  const sockets = onlineUsers[userId] || [];
  sockets.forEach((socketId) => {
    io.to(socketId).emit('notification', notif);
  });
}

// POST /api/wallet/:id/bank/deposit
// 🔒 Uses MongoDB transaction for atomicity
router.post(
  '/:id/bank/deposit',
  auth,
  validateObjectId('id'),
  validateRequest(depositSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const session = await mongoose.startSession();
    
    try {
      await session.startTransaction();

      const user = await User.findById(req.params.id).session(session);
      if (!user) {
        throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, ErrorMessages[ErrorCodes.USER_NOT_FOUND]);
      }

      if (user.balance < amount) {
        throw new AppError(ErrorCodes.INSUFFICIENT_BALANCE, 402, ErrorMessages[ErrorCodes.INSUFFICIENT_BALANCE], {
          required: amount,
          have: user.balance,
        });
      }

      // Update balances atomically
      user.balance -= amount;
      user.bank += amount;
      await user.save({ session });

      // Create transaction record
      await Transaction.create([{
        userId: user._id,
        type: 'deposit',
        amount,
        createdAt: new Date(),
      }], { session });

      await session.commitTransaction();

      // Send notification after commit (outside transaction)
      await pushNotification(req, user._id, 'deposit', `Bạn đã nạp ${amount} từ Tài khoản vào Ngân hàng`);

      res.json({ balance: user.balance, bank: user.bank });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  })
);

// POST /api/wallet/:id/bank/withdraw
// 🔒 Uses MongoDB transaction for atomicity
router.post(
  '/:id/bank/withdraw',
  auth,
  validateObjectId('id'),
  validateRequest(withdrawSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const session = await mongoose.startSession();
    
    try {
      await session.startTransaction();

      const user = await User.findById(req.params.id).session(session);
      if (!user) {
        throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, ErrorMessages[ErrorCodes.USER_NOT_FOUND]);
      }

      if (user.bank < amount) {
        throw new AppError(ErrorCodes.INSUFFICIENT_BANK_BALANCE, 402, ErrorMessages[ErrorCodes.INSUFFICIENT_BANK_BALANCE], {
          required: amount,
          have: user.bank,
        });
      }

      // Update balances atomically
      user.bank -= amount;
      user.balance += amount;
      await user.save({ session });

      // Create transaction record
      await Transaction.create([{
        userId: user._id,
        type: 'withdraw',
        amount,
        createdAt: new Date(),
      }], { session });

      await session.commitTransaction();

      // Send notification after commit (outside transaction)
      await pushNotification(req, user._id, 'withdraw', `Bạn đã rút ${amount} từ Ngân hàng về Tài khoản`);

      res.json({ balance: user.balance, bank: user.bank });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  })
);

// POST /api/wallet/:id/transfer
// 🔒 CRITICAL: Uses MongoDB transaction for atomicity across 2 users
// Ensures both sender deduction and receiver credit happen atomically or rollback completely
router.post(
  '/:id/transfer',
  auth,
  validateObjectId('id'),
  transferLimiter, // ✅ Apply strict rate limit
  validateRequest(transferSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { toUserId, amount } = req.body;

    // ✅ Validate toUserId format
    if (!mongoose.isValidObjectId(toUserId)) {
      throw new AppError(ErrorCodes.INVALID_USER_ID, 400, 'ID người nhận không hợp lệ');
    }

    // Prevent self-transfer
    if (req.params.id === toUserId) {
      throw new AppError(ErrorCodes.INVALID_TRANSFER_DATA, 400, 'Không thể chuyển tiền cho chính mình');
    }

    const session = await mongoose.startSession();
    
    try {
      await session.startTransaction();

      // Lock both users in transaction to prevent race conditions
      const fromUser = await User.findById(req.params.id).session(session);
      const toUser = await User.findById(toUserId).session(session);

      if (!fromUser || !toUser) {
        throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, ErrorMessages[ErrorCodes.USER_NOT_FOUND]);
      }

      if (fromUser.balance < amount) {
        throw new AppError(ErrorCodes.INSUFFICIENT_BALANCE, 402, ErrorMessages[ErrorCodes.INSUFFICIENT_BALANCE], {
          required: amount,
          have: fromUser.balance,
        });
      }

      // Update balances atomically
      fromUser.balance -= amount;
      toUser.balance += amount;
      await fromUser.save({ session });
      await toUser.save({ session });

      // Create both transaction records atomically
      await Transaction.create([
        {
          userId: fromUser._id,
          type: 'transfer',
          amount,
          toUserId: toUser._id,
          createdAt: new Date(),
        },
        {
          userId: toUser._id,
          type: 'transfer',
          amount,
          fromUserId: fromUser._id,
          createdAt: new Date(),
        }
      ], { session });

      await session.commitTransaction();

      // Send notifications after commit (outside transaction)
      await pushNotification(req, fromUser._id, 'transfer_sent', `Bạn đã chuyển ${amount} cho ${toUser.username}`);
      await pushNotification(req, toUser._id, 'transfer_received', `Bạn đã nhận ${amount} từ ${fromUser.username}`);

      res.json({ fromBalance: fromUser.balance, toBalance: toUser.balance });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  })
);

// GET /api/wallet/:id/transactions
router.get(
  '/:id/transactions',
  auth,
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const txs = await Transaction.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ transactions: txs });
  })
);

module.exports = router;