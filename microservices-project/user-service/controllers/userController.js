const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Models
const userSchema = require('../../common/models/user');
const walletSchema = require('../../common/models/wallet');

// Mongo URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

// POST /user → Create user and wallet
router.post('/', async (req, res) => {
    try {
        const { name, email, mobile, userId } = req.body;
        const dbName = `sparkup_${userId}`;

        const userDb = mongoose.connection.useDb(dbName);
        const User = userDb.model('User', userSchema);
        const Wallet = userDb.model('Wallet', walletSchema);

        // Create User
        const newUser = await User.create({ name, email, mobile, userId });
         console.log("newUser", newUser);
         

        // Create Wallet
        const newWallet = await Wallet.create({
            userId,
            balance: 10000,
            hold: 100,
            minLimit: 50,
            maxLimit: 5000,
            lean: 200
        });
         console.log("newWallet", newWallet);
         

        res.status(201).json({ user: newUser, wallet: newWallet });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
