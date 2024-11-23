const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models');
const router = express.Router();
require('dotenv').config();


// User Registration
router.post('/register', async (req, res) => {
    const { username, pin, initialDeposit } = req.body;
    const hashedPin = await bcrypt.hash(pin, 10);
    const accountNumber = `BANK-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newUser  = new User({
        username,
        pin: hashedPin,
        accountNumber,
        balance: initialDeposit || 0,
    });

    try {
        await newUser .save();
        res.status(201).json({ message: 'User  registered successfully', accountNumber });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});




// User Login
router.post('/login', async (req, res) => {
    const { username, pin } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.lockedUntil > Date.now()) {
        return res.status(403).json({ error: 'Account is locked or does not exist' });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (isMatch) {
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, transactions: user.transactions });
    } else {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 3) {
            user.lockedUntil = Date.now() + 24 * 60 * 60 * 1000; 
        }
        await user.save();
        res.status(401).json({ error: 'Invalid credentials' });
    }
});


router.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' });

      const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken: newAccessToken });
  });
});
// Fetch Account Balance
router.get('/balance', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        res.json({
            balance: user.balance,
            accountNumber: user.accountNumber 
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Deposit Money
router.post('/deposit', async (req, res) => {
  const { username, pin, amount } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.lockedUntil > Date.now()) {
      return res.status(403).json({ error: 'Account is locked or does not exist' });
  }

  const isMatch = await bcrypt.compare(pin, user.pin);
  if (isMatch) {
      user.balance += amount;
      user.transactions.push({
          type: 'Deposit',
          amount,
          balanceAfter: user.balance,
      });
      await user.save();
      res.json({ message: 'Deposit successful', balance: user.balance });
  } else {
      res.status(401).json({ error: 'Invalid PIN' });
  }
});

// Withdraw Money
router.post('/withdraw', async (req, res) => {
  const { username, pin, amount } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.lockedUntil > Date.now()) {
      return res.status(403).json({ error: 'Account is locked or does not exist' });
  }

  const isMatch = await bcrypt.compare(pin, user.pin);
  if (isMatch) {
      if (user.balance >= amount) {
          user.balance -= amount;
          user.transactions.push({
              type: 'Withdrawal',
              amount,
              balanceAfter: user.balance,
          });
          await user.save();
          res.json({ message: 'Withdrawal successful', balance: user.balance });
      } else {
          res.status(400).json({ error: 'Insufficient balance' });
      }
  } else {
      res.status(401).json({ error: 'Invalid PIN' });
  }
});


router.post('/transfer', async (req, res) => {
    const { recipientAccountNumber, pin, amount } = req.body;

    try {
        // Validate input
        if (!recipientAccountNumber || !pin || !amount) {
            return res.status(400).json({ error: 'Recipient account, PIN, and amount are required' });
        }

        // Extract sender from the token
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sender = await User.findById(decoded.id);

        if (!sender) {
            return res.status(404).json({ error: 'Sender account not found' });
        }

        // Check if sender's account is locked
        if (sender.lockedUntil && sender.lockedUntil > Date.now()) {
            return res.status(403).json({ error: 'Sender account is locked' });
        }

        // Validate sender's PIN
        const isMatch = await bcrypt.compare(pin, sender.pin);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        // Check if the recipient is the same as the sender
        if (recipientAccountNumber === sender.accountNumber) {
            return res.status(400).json({ error: 'You cannot transfer funds to your own account' });
        }

        // Fetch recipient
        const recipient = await User.findOne({ accountNumber: recipientAccountNumber });
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient does not exist' });
        }

        // Check if the recipient's account is locked
        if (recipient.lockedUntil && recipient.lockedUntil > Date.now()) {
            return res.status(403).json({ error: 'Recipient account is locked' });
        }

        // Check if sender has sufficient balance
        if (sender.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Perform the transfer
        sender.balance -= amount;
        recipient.balance += amount;

        // Log transactions
        sender.transactions.push({
            type: 'Transfer',
            amount,
            balanceAfter: sender.balance,
            recipientAccountNumber,
        });

        recipient.transactions.push({
            type: 'Transfer',
            amount,
            balanceAfter: recipient.balance,
            senderAccountNumber: sender.accountNumber,
        });

        // Save changes to the database
        await sender.save();
        await recipient.save();

        res.json({
            message: 'Transfer successful',
            senderBalance: sender.balance,
            recipientBalance: recipient.balance,
        });
    } catch (error) {
        console.error('Error processing transfer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





router.get('/transactions', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const userId = decoded.id;

        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

   
        const transactions = user.transactions.slice(-10); 

        res.json({
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;