// MTN Mobile Money Payment API
// This is a simple Node.js/Express server for MTN Momo API integration
// You'll need to install: npm install express body-parser cors uuid

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MTN Configuration - Replace with your actual credentials
const MTN_CONFIG = {
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY || 'YOUR_SUBSCRIPTION_KEY',
    apiKey: process.env.MTN_API_KEY || 'YOUR_API_KEY',
    apiSecret: process.env.MTN_API_SECRET || 'YOUR_API_SECRET',
    targetEnvironment: process.env.MTN_ENV || 'sandbox',
    baseUrl: 'https://sandbox.momodeveloper.mtn.com',
    collectionHost: process.env.MTN_COLLECTION_HOST || 'https://sandbox.momodeveloper.mtn.com',
    collectionPort: process.env.MTN_COLLECTION_PORT || '443'
};

// In-memory storage for transactions (use database in production)
let transactions = {};

// Get OAuth Token
async function getAccessToken() {
    const auth = Buffer.from(`${MTN_CONFIG.apiKey}:${MTN_CONFIG.apiSecret}`).toString('base64');
    
    try {
        const response = await fetch(`${MTN_CONFIG.baseUrl}/collection/token/`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey
            }
        });
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Request to Pay (Create Payment)
app.post('/api/mtn/request-pay', async (req, res) => {
    try {
        const { phoneNumber, amount, currency, externalId, payerMessage, payeeNote } = req.body;
        
        // Validate required fields
        if (!phoneNumber || !amount) {
            return res.status(400).json({ 
                error: 'Missing required fields: phoneNumber and amount are required' 
            });
        }
        
        const accessToken = await getAccessToken();
        const transactionId = uuidv4();
        
        const requestBody = {
            amount: amount.toString(),
            currency: currency || 'RWF',
            externalId: externalId || transactionId,
            payer: {
                partyIdType: 'MSISDN',
                partyId: phoneNumber.replace(/[\s\-\(\)]/g, '')
            },
            payerMessage: payerMessage || 'Payment for your order',
            payeeNote: payeeNote || 'Thank you for your order'
        };
        
        const response = await fetch(`${MTN_CONFIG.collectionHost}/collection/v1_0/requesttopay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
                'X-Target-Environment': MTN_CONFIG.targetEnvironment,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
        // Store transaction
        transactions[transactionId] = {
            id: transactionId,
            phoneNumber,
            amount: amount,
            currency: currency || 'RWF',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            momoResponse: result
        };
        
        if (response.ok || response.status === 202) {
            return res.json({
                success: true,
                transactionId,
                status: 'PENDING',
                message: 'Payment request sent successfully. Please check your phone to confirm.'
            });
        } else {
            return res.status(response.status).json({
                success: false,
                error: result,
                message: 'Failed to initiate payment'
            });
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Internal server error'
        });
    }
});

// Check Transaction Status
app.get('/api/mtn/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const accessToken = await getAccessToken();
        
        const response = await fetch(
            `${MTN_CONFIG.collectionHost}/collection/v1_0/requesttopay/${transactionId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
                    'X-Target-Environment': MTN_CONFIG.targetEnvironment
                }
            }
        );
        
        const result = await response.json();
        
        // Update stored transaction
        if (transactions[transactionId]) {
            transactions[transactionId].status = result.status;
            transactions[transactionId].momoResponse = result;
        }
        
        return res.json({
            success: true,
            transactionId,
            status: result.status,
            result
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction by ID
app.get('/api/mtn/transaction/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = transactions[transactionId];
    
    if (transaction) {
        return res.json({ success: true, transaction });
    } else {
        return res.status(404).json({ 
            success: false, 
            error: 'Transaction not found' 
        });
    }
});

// Webhook for payment callbacks (MTN will call this)
app.post('/api/mtn/callback', (req, res) => {
    const callbackData = req.body;
    console.log('Payment callback received:', callbackData);
    
    const transactionId = callbackData.externalId || callbackData.resourceReference;
    
    if (transactionId && transactions[transactionId]) {
        transactions[transactionId].status = callbackData.status;
        transactions[transactionId].callbackReceivedAt = new Date().toISOString();
        transactions[transactionId].callbackData = callbackData;
    }
    
    return res.status(200).json({ received: true });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`MTN Payment API running on port ${PORT}`);
    console.log(`Configure your MTN credentials in environment variables:`);
    console.log(`- MTN_SUBSCRIPTION_KEY`);
    console.log(`- MTN_API_KEY`);
    console.log(`- MTN_API_SECRET`);
});

module.exports = app;
