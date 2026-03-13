# SHAZAM Coffee Shop App - Installation & Setup Guide

## What's New: Multi-Device Cloud Sync

Your SHAZAM app now uses **Firebase** to sync orders across all devices in real-time!

### Before: Local Storage Only ❌
- Customer places order on Phone → Only visible on that Phone
- Barista can't see orders from other devices
- No real-time sync

### After: Firebase Cloud Storage ✅
- Customer places order on Phone → Visible on ALL devices instantly
- Barista sees ALL orders from all devices in one dashboard
- Real-time updates without refreshing
- Works on phone, laptop, tablet, etc.

---

## Quick Setup (3 Steps)

### Step 1: Firebase Database Rules (5 minutes)

1. Visit: https://console.firebase.google.com/
2. Go to **Build → Realtime Database**
3. Click **Rules** tab
4. Replace all code with this:

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

5. Click **Publish**
6. Wait 1-2 seconds ⏳

### Step 2: Files Already Updated ✅

All these files are already updated with Firebase:
- ✅ `menu.html` - Added Firebase SDK
- ✅ `menu-script.js` - Saves orders to Firebase
- ✅ `barista.html` - Added Firebase SDK
- ✅ `barista-script.js` - Reads/updates orders from Firebase

**No code changes needed on your end!**

### Step 3: Test It Works

**Test 1: Order from Phone → See on Laptop**
1. Open `menu.html` on your phone
2. Select a coffee item and place an order
3. Open `barista.html` on your laptop
4. Login with credentials
5. **You should see the order immediately!** ✅

**Test 2: Real-Time Sync**
1. Place order on Phone A
2. On Laptop, watch the order appear **without refreshing**
3. Change status on Laptop
4. Watch Phone update **in real-time**

---

## How to Use

### For Customers 👥

**Place an Order:**
1. Open `menu.html` on any device (phone, tablet, computer)
2. Browse coffee menu
3. Click on a coffee item
4. Fill in:
   - Your name
   - Phone number
   - Pickup time (minutes)
   - Special requests (optional)
5. Click "Place Order"
6. **Order is now in the system and visible to barista!**

**Track Your Order:**
- See countdown timer showing when order will be ready
- "ORDER READY FOR PICKUP" message appears when done
- You can view this from any device you used (phone, laptop, etc.)

### For Baristas ☕

**Access Dashboard:**
1. Open `barista.html` on your laptop/tablet
2. Login with credentials:
   - Username: [provided separately]
   - Password: [provided separately]
   - Keyword: [provided separately]

**See All Orders:**
- Dashboard shows ALL orders from all devices in real-time
- No need to refresh - updates automatically
- See customer name, phone, special instructions

**Manage Orders:**
1. Prepare the coffee according to order
2. Click "✓ Mark Ready" when done
3. Order status changes to "READY FOR PICKUP"
4. Click "🗑️ Remove" when customer picks up

---

## Important Notes

### Firebase Config

Your Firebase config is already in both scripts:
- `menu-script.js` (line 2-10)
- `barista-script.js` (line 2-10)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCnoVYQ_BgOSNeVuJPE0hF92beCrWhpoPE",
  authDomain: "shazam-coffee.firebaseapp.com",
  projectId: "shazam-coffee",
  storageBucket: "shazam-coffee.firebasestorage.app",
  messagingSenderId: "303645613348",
  appId: "1:303645613348:web:fd463f95c4bb95d16fa7b1"
};
```

**⚠️ Important:** This API key is public (fine for a local shop). If deploying publicly, add authentication.

### Database Structure

Orders are stored in Firebase Realtime Database under `/orders`:

```
orders/
├── 1234567890/
│   ├── id: "1234567890"
│   ├── itemName: "Cappuccino"
│   ├── customerName: "John"
│   ├── customerPhone: "555-1234"
│   ├── pickupMinutes: 5
│   ├── specialInstructions: "Extra hot"
│   ├── orderTime: "2025-11-11T10:30:00Z"
│   ├── endTime: "2025-11-11T10:35:00Z"
│   └── status: "active"
└── 1234567891/
    └── ...
```

---

## Troubleshooting

### Problem: "Order not appearing on other device"

**Solution:**
1. Check internet connection on both devices
2. Make sure Firebase rules are **Published** (step 1)
3. Refresh the page
4. Check browser console for errors (F12)

### Problem: "Permission denied" error

**Solution:**
1. Go back to Firebase Console
2. Check Realtime Database rules
3. Make sure you replaced ALL the code (including the closing brace)
4. Click **Publish** again
5. Wait 2-3 seconds
6. Refresh the page

### Problem: "Orders still using localStorage instead of Firebase"

**Solution:**
- This is normal for a short time
- Firebase uses localStorage as fallback
- Clear browser cache (Ctrl+Shift+Delete)
- Or open in Incognito/Private mode
- Orders will sync to Firebase automatically

### Problem: "Can't login to barista dashboard"

**Solution:**
1. Check credentials (case-sensitive!)
2. Make sure all 3 fields are filled
3. Clear browser cache
4. Try incognito/private mode
5. Check browser console for errors

---

## File Structure

```
Shazam/
├── index.html                 # Landing page
├── menu.html                  # Customer menu & ordering
├── menu-script.js             # Order logic (Firebase enabled)
├── menu-style.css             # Menu styling
├── barista.html               # Barista dashboard
├── barista-script.js          # Dashboard logic (Firebase enabled)
├── barista-style.css          # Dashboard styling
├── favicon.svg                # App icon
├── README.md                  # User guide
├── FIREBASE_SETUP.md          # Firebase setup instructions
├── INSTALLATION.md            # This file
└── [screenshots & assets]
```

---

## Firebase Project Info

- **Project Name:** shazam-coffee
- **Database Type:** Realtime Database (JSON)
- **Database Location:** us-central1 (auto-selected)
- **Free Tier Limits:** 
  - 100 concurrent connections ✅ (plenty for a small shop)
  - 1GB storage ✅ (plenty for orders)

---

## Next Steps

1. ✅ Set Firebase Rules (FIREBASE_SETUP.md)
2. ✅ Test on multiple devices
3. ✅ Train staff on using barista dashboard
4. ✅ Monitor Firebase usage in console
5. 📈 Future: Add customer receipts, payment integration, etc.

---

## Support

**Errors in Browser Console (F12)?**
- Screenshot the error
- Check Firebase project is accessible
- Verify internet connection
- Try a different device

**Questions?**
- See README.md for detailed features
- See FIREBASE_SETUP.md for database rules
- Check Firebase console for data

---

**Version:** 2.0 - Firebase Cloud Sync  
**Last Updated:** November 2025  
**Made by:** AJM Digital Solution
