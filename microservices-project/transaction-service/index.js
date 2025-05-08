const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
require('dotenv').config();

const transactionSchema = require('./models/transaction');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Transaction Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route to create transaction
app.post('/transaction', async (req, res) => {
    const { userId, serviceId, amount } = req.body;

    if (!userId || !serviceId || !amount) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        // Connect to the user-specific database
        const userDB = mongoose.connection.useDb(`sparkup_${userId}`);
        const Transaction = userDB.model('Transaction', transactionSchema);

        const transactionData = {
            userId,
            serviceId,
            amount,
            status: 'initiated'
        };

        // Connect to RabbitMQ and push the transaction data
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();
        await channel.assertQueue('transaction_queue');
        channel.sendToQueue('transaction_queue', Buffer.from(JSON.stringify(transactionData)));

        res.status(202).json({ message: "Transaction queued successfully." });
    } catch (err) {
        console.error("Transaction error:", err);
        res.status(500).json({ message: "Failed to process transaction" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Transaction Service is running on port ${process.env.PORT}`);
});
