require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Auth Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/login', authController.login);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
