require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const runCronJob = require('./cron');

const PORT = process.env.PORT || 3008;

mongoose.connect(`${process.env.MONGO_URI}/transaction_service`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected for Cron Service');
    runCronJob(); 
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.listen(PORT, () => {
    console.log(`Cron Service is running on port ${PORT}`);
});
