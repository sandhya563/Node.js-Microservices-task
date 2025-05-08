const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Wallet = require('../common/models/wallet');

dotenv.config();

const app = express();
app.use(express.json());

// Dynamic DB connection utility
const connectToUserDB = async (userId) => {
  const dbName = `sparkup_${userId}`;
  const dbUri = `${process.env.MONGO_URI}/${dbName}`;
  const conn = await mongoose.createConnection(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return conn.model('Wallet', Wallet.schema); // Use Wallet schema in this DB
};

// 🌐 Top-up Wallet API
app.post('/topup', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'userId and amount are required' });
  }

  try {
    const WalletModel = await connectToUserDB(userId);
    const wallet = await WalletModel.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    let remainingAmount = amount;

    // Deduct lean amount first
    if (wallet.lean > 0) {
      if (remainingAmount >= wallet.lean) {
        remainingAmount -= wallet.lean;
        wallet.lean = 0;
      } else {
        wallet.lean -= remainingAmount;
        remainingAmount = 0;
      }
    }

    wallet.balance += remainingAmount;

    await wallet.save();

    return res.status(200).json({
      message: 'Wallet topped up successfully',
      wallet,
    });
  } catch (err) {
    console.error('Error topping up wallet:', err);
    return res.status(500).json({ message: `Error topping up wallet: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Wallet Service listening on port ${PORT}`);
});
