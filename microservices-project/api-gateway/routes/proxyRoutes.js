const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = (app) => {
  app.use('/user-service', authMiddleware, createProxyMiddleware({
    target: 'http://user-service:3001',
    changeOrigin: true,
    pathRewrite: { '^/user-service': '' }
  }));

  app.use('/wallet-service', authMiddleware, createProxyMiddleware({
    target: 'http://wallet-service:3002',
    changeOrigin: true,
    pathRewrite: { '^/wallet-service': '' }
  }));

  app.use('/transaction-service', authMiddleware, createProxyMiddleware({
    target: 'http://transaction-service:3003',
    changeOrigin: true,
    pathRewrite: { '^/transaction-service': '' }
  }));

};
