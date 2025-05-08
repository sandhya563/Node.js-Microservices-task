const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/api/process-transaction', (req, res) => {
    const { transactionId, amount } = req.body;

    console.log(`Processing transaction: ${transactionId}, Amount: ${amount}`);

    // Simulate async success after 2 seconds
    setTimeout(() => {
        return res.status(200).json({
            transactionId,
            status: 'SUCCESS',
            processedAt: new Date()
        });
    }, 2000);
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Dummy Bank API running on port ${PORT}`);
});
