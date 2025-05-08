require('dotenv').config();
const express = require('express');
const setupProxies = require('./routes/proxyRoutes');

const app = express();
setupProxies(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
