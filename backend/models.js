const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    pin: { type: String, required: true },
    accountNumber: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [{
        type: { type: String, enum: ['Deposit', 'Withdrawal', 'Transfer'], required: true },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        balanceAfter: { type: Number, required: true },
        recipient: { type: String },
    }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
});

module.exports = mongoose.model('User ', userSchema);