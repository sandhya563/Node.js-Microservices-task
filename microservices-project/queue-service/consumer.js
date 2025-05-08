const amqp = require('amqplib');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const transactionSchema = require('../transaction-service/models/transaction'); // use your actual model
const walletSchema = require('../common/models/wallet'); // use your actual model

const QUEUE_NAME = 'transactionQueue';

(async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Waiting for messages in ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const { userId, serviceId, amount } = data;

      try {
        const dbName = `sparkup_${userId}`;
        const conn = await mongoose.createConnection(`${process.env.MONGO_URI}/${dbName}`, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        const Wallet = conn.model('Wallet', walletSchema);
        const Transaction = conn.model('Transaction', transactionSchema);

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) throw new Error('Wallet not found');

        // Validate wallet rules
        const availableBalance = wallet.balance - wallet.hold;
        if (amount < wallet.minLimit || amount > wallet.maxLimit || availableBalance < amount) {
          throw new Error('Wallet rule violation');
        }

        const serviceCharge = 2.5; // You may compute dynamically
        const gst = (serviceCharge * 18) / 100;
        const totalDeduction = amount + serviceCharge + gst;

        const prevBalance = wallet.balance;
        wallet.balance -= totalDeduction;
        await wallet.save();

        const txn = new Transaction({
          amount,
          userId,
          serviceId,
          serviceCharge,
          gst,
          prevBalance,
          updatedBalance: wallet.balance,
          status: 'awaited'
        });

        await txn.save();

        // Simulate call to dummy third-party API
        await axios.post('http://dummy-bank-api:3009/transaction', {
          userId,
          amount,
          txnId: txn._id
        });

        console.log(`Transaction processed and sent to dummy bank: ${txn._id}`);
        channel.ack(msg);

      } catch (err) {
        console.error('Queue Service Error:', err.message);
        channel.nack(msg, false, false); // optionally send to dead-letter queue
      }
    }, { noAck: false });

  } catch (err) {
    console.error('RabbitMQ Consumer Error:', err.message);
  }
})();
