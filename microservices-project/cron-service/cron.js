const axios = require('axios');
const mongoose = require('mongoose');
const transactionSchema = require('../common/models/transaction.model');

const Transaction = mongoose.model('Transaction', transactionSchema);

const runCronJob = () => {
    setInterval(async () => {
        console.log('Running cron to check pending transactions...');
        try {
            const pendingTxns = await Transaction.find({ status: 'PENDING' });
            for (const txn of pendingTxns) {
                const response = await axios.post(process.env.BANK_API_URL, {
                    transactionId: txn._id
                });

                const updatedStatus = response.data.status;
                if (updatedStatus !== txn.status) {
                    txn.status = updatedStatus;
                    await txn.save();
                    console.log(`Transaction ${txn._id} updated to ${updatedStatus}`);
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error.message);
        }
    }, 10000); 
};

module.exports = runCronJob;
