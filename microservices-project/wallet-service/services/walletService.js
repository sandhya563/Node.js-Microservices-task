const Wallet = require('../../common/models/wallet');  

// Get Wallet by UserId
async function getWallet(userId) {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found!');
        }
        return wallet;
    } catch (error) {
        throw new Error('Error fetching wallet: ' + error.message);
    }
}

// Top-up Wallet function
async function topUpWallet(userId, amount) {
    try {
        const wallet = await getWallet(userId);

        let remainingAmount = amount;

        // Deduct from lean first
        if (wallet.lean > 0) {
            if (wallet.lean >= remainingAmount) {
                wallet.lean -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= wallet.lean;
                wallet.lean = 0;
            }
        }

        // Deduct remaining from balance
        if (remainingAmount > 0) {
            wallet.balance += remainingAmount;
        }

        await wallet.save();
        return wallet;
    } catch (error) {
        throw new Error('Error topping up wallet: ' + error.message);
    }
}

// Check if a transaction can be processed
async function canProcessTransaction(userId, amount) {
    try {
        const wallet = await getWallet(userId);
        const availableBalance = wallet.balance - wallet.hold;

        // Check the rules
        if (amount < wallet.minLimit) {
            throw new Error('Amount is below minimum limit');
        }
        if (amount > wallet.maxLimit) {
            throw new Error('Amount exceeds maximum limit');
        }
        if (availableBalance < amount) {
            throw new Error('Insufficient balance');
        }

        return true; // Transaction can be processed
    } catch (error) {
        throw new Error('Error checking transaction: ' + error.message);
    }
}

module.exports = { getWallet, topUpWallet, canProcessTransaction };
