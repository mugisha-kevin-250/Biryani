# MTN Mobile Money Integration Guide

## Setup Instructions

To enable MTN Mobile Money payments in your Biryani House app, follow these steps:

### 1. Get MTN API Credentials

1. Register at [MTN Developer Portal](https://developer.mtn.com/)
2. Create a new application
3. Get your credentials:
   - API Key
   - API Secret
   - Subscription Key

### 2. Configure in menu-script.js

Open `menu-script.js` and find the MTN_CONFIG section at the top of the file:

```javascript
const MTN_CONFIG = {
    apiKey: 'YOUR_MTN_API_KEY',          // Replace with your MTN API Key
    apiSecret: 'YOUR_MTN_API_SECRET',    // Replace with your MTN API Secret
    providerCallbackHost: 'YOUR_CALLBACK_URL', // Your callback URL
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',  // MTN Subscription Key
    environment: 'sandbox',              // Use 'production' for live
    merchantId: 'YOUR_MERCHANT_ID'      // Your merchant ID
};
```

Replace the placeholder values with your actual MTN API credentials.

### 3. Production Considerations

- For production, you'll need a backend server to handle MTN API calls securely
- Never expose your API secrets in client-side code
- Contact MTN Rwanda for business account setup

### 4. Testing

The app includes a demo mode that simulates payment processing. To test:
1. Click on any menu item
2. Select "MTN Mobile Money" as payment method
3. Enter a phone number
4. Click "Pay & Confirm Order"

The order will be created with payment status tracking.

### Features Implemented

- ✅ Search box with debouncing for better performance
- ✅ Internet-based food images loaded from Unsplash CDN
- ✅ Payment modal opens when clicking on menu items
- ✅ MTN Mobile Money payment option
- ✅ Pay at pickup option
- ✅ Payment status tracking in orders
