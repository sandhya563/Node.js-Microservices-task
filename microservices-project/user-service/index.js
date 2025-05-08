const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./controllers/userController');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/user', userRoutes);

const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI + '/user_service', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
