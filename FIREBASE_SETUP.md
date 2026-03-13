# Firebase Setup Instructions

Your SHAZAM Coffee Shop app now uses Firebase to sync orders across all devices in real-time!

## Firebase Database Rules Setup

To make your app work properly, you need to set public read/write rules in Firebase (for local/shop use):

### Steps:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: **shazam-coffee**

2. **Navigate to Realtime Database:**
   - Go to: **Build → Realtime Database**

3. **Click on the "Rules" tab** (top of the database view)

4. **Replace all existing rules with this:**

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true,
      "$orderId": {
        ".validate": "newData.hasChildren(['id', 'itemName', 'customerName', 'customerPhone', 'orderTime', 'endTime', 'status'])"
      }
    }
  }
}
```

5. **Click "Publish"** to save the rules

## What This Does

✅ **Allows anyone to read orders** - Customers can see their orders from any device  
✅ **Allows anyone to write orders** - Customers can place orders  
✅ **Allows barista to update orders** - Barista can mark orders as ready and remove them  
✅ **Public access (for local shop use)** - No login needed for customers to place orders  

## How It Works Now

### Customer Side (menu.html):
- Customer places order on **Phone A**
- Order is saved to Firebase automatically
- Barista can see it immediately on **Laptop**
- Customer can switch to **Phone B** and still see the same order in progress

### Barista Side (barista.html):
- Barista logs in with credentials
- Sees **ALL** orders from **ALL** devices in real-time
- Updates orders (mark as ready, remove)
- All devices sync instantly

## Testing

1. **Test on Multiple Devices:**
   - Open menu.html on your phone, place an order
   - Open barista.html on your laptop
   - You should see the order appear immediately
   - Mark it as ready - watch it update on the phone instantly

2. **Test Real-Time Sync:**
   - Place order on Device A
   - Open barista on Device B
   - The order appears instantly (no refresh needed)

## Security Note

These rules allow **public access** which is fine for a **local coffee shop** where the barista dashboard is behind a username/password login. 

If you want to deploy this publicly in the future, you should:
- Add Firebase Authentication
- Restrict write access only to authorized users
- Implement customer phone number verification

For now, this setup is perfect for your local shop!

## Troubleshooting

**Orders not appearing?**
- Check if Firebase rules are published
- Check browser console for errors (F12)
- Make sure Firebase config is correct in menu-script.js and barista-script.js

**Orders not syncing?**
- Check internet connection
- Refresh the page
- Check Firebase console to see if data is being saved

**Getting "Permission denied" error?**
- Re-check your database rules
- Make sure you clicked "Publish"
- Wait 1-2 seconds after publishing before testing

## Firebase Config Used

```
Project: shazam-coffee
Database URL: https://shazam-coffee-default-rtdb.firebaseio.com
API Key: AIzaSyCnoVYQ_BgOSNeVuJPE0hF92beCrWhpoPE
```

Your configuration is already embedded in:
- menu-script.js
- barista-script.js

**Do NOT share your API key publicly, but for a local shop environment it's fine.**

---

Need help? Check the browser console (F12) for error messages.
