# Manager Dashboard - Quick Reference Guide

## Login
1. Go to the staff login page (barista.html)
2. Click **Manager** button
3. Enter credentials:
   - **Username:** Manager
   - **Password:** [Your manager password]
   - **Keyword:** SHOP
4. Click **Login**

---

## Manager Dashboard Overview

### Dashboard Sections
- **Orders Panel** (Left/Main) - All orders with sorting and filtering
- **Baristas Panel** (Right) - List of active baristas

### Statistics Display
At the top, you'll see real-time stats:
- **Total Orders** - All orders for the day
- **Pending** - Unassigned and active orders
- **Completed** - Finished orders

---

## Managing Orders

### Viewing Orders by Date

**Today's Orders (Default)**
- Dashboard automatically shows today's orders
- Orders displayed in reverse chronological order (newest first)

**View Past Orders**
1. Click the date picker 📅 in the control bar
2. Select a date from the calendar
3. Orders from that date will display
4. Click **🔄 Today** button to return to today's view

**Order Information Displayed**
- Item name and price
- Customer name and phone
- Pickup time estimate
- Order status (Pending, Active, Assigned, Completed)
- Assignment status

---

## Assigning Orders to Baristas

### To Assign an Order
1. Find an unassigned order (shows "👉 Assign to Barista" button)
2. Click the button
3. Select a barista from the dropdown
4. Click **✓ Assign Order**
5. Success message confirms assignment
6. Order status changes to "ASSIGNED"

### Order Status Meanings
- **PENDING** - New order, not yet assigned (yellow)
- **ACTIVE** - Customer's order, ready to be made (yellow)
- **ASSIGNED** - Assigned to a barista, being prepared (blue)
- **COMPLETED** - Finished and ready for customer pickup (green)
- **READY** - Alternative status for completed orders (green)

---

## Deleting Completed Orders

### To Delete a Completed Order
1. Locate a completed order (green status indicator)
2. Click the red **🗑️ Delete** button
3. Confirm deletion when prompted
4. Order is permanently removed
5. Success message confirms deletion

**Note:** Delete button only appears for COMPLETED orders

---

## Managing Baristas

### Add a New Barista
1. Click **👨‍💼 Manage Baristas** button
2. In the modal, enter barista's name
3. Click **✓ Add Barista**
4. New barista appears in the list
5. Barista can now log in with their name

### Delete a Barista
1. Click **👨‍💼 Manage Baristas** button
2. Find the barista in the list
3. Click the red **Delete** button next to their name
4. Confirm deletion
5. Barista is removed from the system

---

## Control Bar Buttons

| Button | Function |
|--------|----------|
| 👨‍💼 Manage Baristas | Add/Remove baristas |
| 📢 Post Announcement | Send message to all staff |
| 🔄 Refresh | Reload all orders and data |
| 📅 Date Picker | Select date to view past orders |
| 🔄 Today | Return to today's orders |
| 🚪 Logout | Exit manager dashboard |
| ← Back to Menu | Return to customer menu |

---

## Daily Order Reset

### How It Works
- **6:00 AM** - System starts accepting orders
- **Throughout the day** - All orders appear in dashboard
- **Midnight (00:00)** - Previous day's completed orders are archived
- **Next day** - Fresh new order list, clean dashboard

### Viewing Past Orders
- Archived orders are NOT shown in today's view
- Use the date picker to select a past date
- View all orders (including completed/archived) from that day

---

## Features & Workflow

### Fresh Daily Tab
✅ Each day starts fresh with no previous orders visible  
✅ Keeps dashboard clean and organized  
✅ Historical data preserved for past date viewing  

### Complete Order Lifecycle
1. **Customer places order** (6 AM - 11:59 PM)
2. **Appears as PENDING/ACTIVE** in dashboard
3. **Manager assigns to barista**
4. **Barista marks as COMPLETED**
5. **Manager reviews and deletes if needed**
6. **Midnight reset archives completed orders**

### Time Window Control
- **Orders accepted:** 6:00 AM - 11:59 PM
- **Orders blocked:** Midnight - 5:59 AM
- **Customer notification:** Clear message when ordering outside hours

---

## Tips & Best Practices

### Efficiency Tips
- Check dashboard regularly for new orders
- Assign orders promptly to available baristas
- Use date filter to review previous days
- Delete completed orders to keep dashboard clean

### Barista Management
- Create barista accounts at the start of shift
- Assign based on workload and capacity
- Monitor orders assigned to each barista
- Remove baristas at end of shift

### Customer Service
- Monitor order status in real-time
- Delete old completed orders to avoid clutter
- Post announcements for shop updates
- Check daily at 6 AM for opening procedures

---

## Troubleshooting

### Orders Not Appearing
- Check the date filter (should be today's date)
- Click **🔄 Refresh** to reload data
- Verify Firebase connection (check browser console)

### Can't Assign Order
- Ensure baristas are created first
- Click "Manage Baristas" to add staff
- Refresh page if dropdown is empty

### Delete Not Working
- Only completed (green) orders can be deleted
- Confirm the deletion prompt
- Try refreshing if error occurs

### Date Filter Issues
- Date picker shows today's date by default
- Click **🔄 Today** button to reset
- Past dates show archived orders

---

## Firebase Offline Mode

The system works even without internet:
- ✅ All features available locally
- ✅ Data syncs when connection returns
- ✅ localStorage backup handles everything

---

## Security

- **Manager login** protects staff features
- **Keyword requirement** (SHOP) adds security layer
- **Session storage** keeps you logged in during shift
- **Logout** clears session data

---

## Quick Actions Keyboard Shortcuts

| Action | How |
|--------|-----|
| Refresh orders | Click 🔄 Refresh button |
| Return to today | Click 🔄 Today button |
| Assign order | Click blue button on order card |
| Delete order | Click red 🗑️ button on completed orders |
| View past orders | Select date from picker |
| Logout | Click 🚪 Logout button |

---

## Contact & Support

For issues or feature requests, refer to the technical documentation in `FEATURE_UPDATES.md`
