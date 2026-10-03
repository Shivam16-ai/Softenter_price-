# Universal Order Hub - Testing Guide
## SWIFTRoute Enterprise Parcel Management System

**Feature:** Universal Order Hub + Smart Delivery Management  
**Version:** 1.0.0  
**Last Updated:** October 2, 2026

---

## Table of Contents
1. [Test Environment Setup](#1-test-environment-setup)
2. [User Test Accounts](#2-user-test-accounts)
3. [Functional Testing](#3-functional-testing)
4. [Security Testing](#4-security-testing)
5. [Real-Time Updates Testing](#5-real-time-updates-testing)
6. [Integration Testing](#6-integration-testing)
7. [UI/UX Testing](#7-uiux-testing)
8. [Performance Testing](#8-performance-testing)
9. [Bug Reporting](#9-bug-reporting)

---

## 1. Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Seed database (if needed)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables
Verify `.env` file contains:
```
DATABASE_URL="file:./backend/database/datastore.json"
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
PORT=3000
NODE_ENV="development"
```

### Expected Server Output
```
✓ Database connection established
✓ API Routes mounted
✓ Server running on http://localhost:3000
✓ Real-time service initialized
```

---

## 2. User Test Accounts

### Test Customer Accounts
Create test accounts or use existing seeded data:

**Customer 1:**
- Email: `customer1@test.com`
- Password: `password123`
- Role: Customer
- Use for: Primary testing account

**Customer 2:**
- Email: `customer2@test.com`
- Password: `password123`
- Role: Customer
- Use for: Data isolation testing

### Test Agent Account
**Agent 1:**
- Email: `agent1@test.com`
- Password: `password123`
- Role: Agent
- Use for: Testing agent-side status updates

---

## 3. Functional Testing

### 3.1 Universal Order Hub Dashboard

#### Test Case 1: View Order Hub Dashboard
**Steps:**
1. Login as Customer 1
2. Navigate to "Universal Order Hub" from sidebar
3. Verify dashboard loads successfully

**Expected Results:**
- ✅ Dashboard displays with gradient hero section
- ✅ Stats cards show: Total Orders, In Transit, Out for Delivery, Delivered, Returns, Attention Required
- ✅ "Live" indicator shows connection status (green when connected)
- ✅ Platform filter, status filter, search bar visible
- ✅ Orders displayed in table view by default
- ✅ Empty state shown if no orders exist

#### Test Case 2: Add External Order Manually
**Steps:**
1. Click "Add Order" button
2. Fill in form:
   - Platform: Amazon
   - Order ID: AMZ-TEST-001
   - Tracking Number: TRK123456789
   - Product Name: Wireless Earbuds
   - Product Category: Electronics
   - Quantity: 1
   - Order Amount: 2999
   - Order Date: Today
   - Delivery Address: 123 Test St, San Francisco, CA 94102
   - Recipient Name: John Doe
   - Recipient Phone: +1234567890
3. Click "Add Order"

**Expected Results:**
- ✅ Modal closes
- ✅ Success notification appears
- ✅ New order appears in order list
- ✅ Stats counters increment
- ✅ Order shows correct platform badge (Amazon)
- ✅ Order status is "ordered"

#### Test Case 3: Import by Tracking Number
**Steps:**
1. Click "Track Shipment" button
2. Enter tracking number: `TRACK-TEST-789`
3. Select courier: FedEx
4. Select platform: Flipkart
5. Click "Import Order"

**Expected Results:**
- ✅ Modal closes
- ✅ Order imported successfully
- ✅ Order appears with tracking number
- ✅ Status set to "in_transit"

#### Test Case 4: Filter and Search
**Steps:**
1. Add multiple orders from different platforms
2. Use status filter: Select "In Transit"
3. Use platform filter: Select "Amazon"
4. Use search: Enter product name

**Expected Results:**
- ✅ Filters work independently
- ✅ Multiple filters combine correctly
- ✅ Search works on order ID, tracking number, product name
- ✅ No results state shows when no matches

#### Test Case 5: Sort Orders
**Steps:**
1. Click sort dropdown
2. Select "Sort by Platform"
3. Toggle sort order (asc/desc)

**Expected Results:**
- ✅ Orders sort by platform alphabetically
- ✅ Sort order toggles correctly
- ✅ Date sorting works (newest/oldest)

#### Test Case 6: View Modes
**Steps:**
1. Click grid view icon
2. Verify grid view displays
3. Click table view icon
4. Verify table view displays

**Expected Results:**
- ✅ Grid view shows cards with product images
- ✅ Table view shows compact row format
- ✅ View preference persists during session

---

### 3.2 Order Details & Tracking

#### Test Case 7: View Order Details
**Steps:**
1. Click "View Details" on any order
2. Verify OrderDetailsView opens

**Expected Results:**
- ✅ Modal/page displays with order information
- ✅ Three tabs visible: Timeline, Details, Live Tracking
- ✅ Timeline tab active by default
- ✅ Delivery timeline shows progress
- ✅ Current status highlighted
- ✅ ETA displayed correctly

#### Test Case 8: View Tracking Timeline
**Steps:**
1. Open order details
2. Click "Timeline" tab
3. Verify tracking events displayed

**Expected Results:**
- ✅ Events shown in chronological order
- ✅ Each event has timestamp, location, description
- ✅ Status icons match event type
- ✅ Current status highlighted with animation

#### Test Case 9: Copy Tracking Number
**Steps:**
1. Open order details
2. Click "Copy" button next to tracking number

**Expected Results:**
- ✅ Tracking number copied to clipboard
- ✅ Success toast notification appears
- ✅ Button shows "Copied!" feedback

---

### 3.3 Returns Management

#### Test Case 10: Create Return Request
**Steps:**
1. Navigate to "Returns & Pickups" from sidebar
2. Click "Request Return" button
3. Fill in form:
   - Select order: Choose from dropdown
   - Product Name: Wireless Earbuds
   - Reason: Defective/Not Working
   - Description: Product stopped working after 2 days
   - Pickup Address: Same as delivery
4. Upload photos (optional)
5. Click "Submit Return Request"

**Expected Results:**
- ✅ Return request created successfully
- ✅ Return number generated (e.g., RET-20261002-001)
- ✅ Status set to "requested"
- ✅ Notification sent to customer
- ✅ Return appears in returns list

#### Test Case 11: View Return Requests
**Steps:**
1. Navigate to "Returns & Pickups"
2. Verify returns list displays

**Expected Results:**
- ✅ All customer returns displayed
- ✅ Stats cards show total, pending, in-progress, completed
- ✅ Status badges color-coded correctly
- ✅ Filter by status works
- ✅ Search by return number works

#### Test Case 12: Track Return Status
**Steps:**
1. Admin approves return (manual backend step)
2. Refresh returns page
3. Verify status changed to "approved"

**Expected Results:**
- ✅ Status badge updates
- ✅ Real-time notification received
- ✅ Return details show approval info

---

### 3.4 Notifications

#### Test Case 13: View Notifications
**Steps:**
1. Navigate to "Notifications" from sidebar
2. Verify notification list displays

**Expected Results:**
- ✅ All notifications displayed
- ✅ Priority color coding (high=red, medium=orange, low=blue)
- ✅ Unread notifications highlighted
- ✅ Unread count badge shows correct number
- ✅ Filter tabs work (All, Unread, Orders, Returns)

#### Test Case 14: Mark Notification as Read
**Steps:**
1. Click "Mark as Read" on unread notification

**Expected Results:**
- ✅ Notification marked as read
- ✅ Visual style changes (opacity)
- ✅ Unread count decrements
- ✅ Checkmark icon appears

#### Test Case 15: Mark All as Read
**Steps:**
1. Click "Mark All as Read" button

**Expected Results:**
- ✅ All notifications marked as read
- ✅ Unread count goes to 0
- ✅ Visual feedback provided

---

### 3.5 Customer Analytics

#### Test Case 16: View Analytics Dashboard
**Steps:**
1. Navigate to "My Analytics" from sidebar
2. Verify analytics page loads

**Expected Results:**
- ✅ Performance metrics displayed:
  - On-time delivery rate
  - Average delivery time
  - Successful deliveries
  - Failed deliveries
- ✅ Spending analysis shows:
  - Total spent
  - Average per order
- ✅ Orders by platform chart displayed
- ✅ Monthly trends chart shows order volume

#### Test Case 17: Verify Metrics Accuracy
**Steps:**
1. Count delivered orders manually
2. Compare with "Successful Deliveries" metric
3. Check on-time delivery calculation

**Expected Results:**
- ✅ Metrics match actual order data
- ✅ Percentages calculated correctly
- ✅ Charts render without errors

---

### 3.6 Delivery Preferences

#### Test Case 18: View Delivery Preferences
**Steps:**
1. Navigate to "Delivery Preferences" from sidebar
2. Verify preferences page loads

**Expected Results:**
- ✅ Preference toggles displayed:
  - Contactless Delivery
  - Leave at Door
  - Signature Required
  - Photo on Delivery
- ✅ Delivery time window selector visible
- ✅ Special instructions textarea visible
- ✅ Current preferences loaded

#### Test Case 19: Toggle Delivery Preference
**Steps:**
1. Toggle "Contactless Delivery" switch
2. Wait for save confirmation

**Expected Results:**
- ✅ Toggle switch animates
- ✅ Success notification appears
- ✅ Preference saved to backend
- ✅ Reload page shows updated preference

#### Test Case 20: Set Delivery Time Window
**Steps:**
1. Select "Morning (9AM - 12PM)" option
2. Click "Save Preferences"

**Expected Results:**
- ✅ Time window saved
- ✅ Radio button selected
- ✅ Success feedback shown

#### Test Case 21: Add Special Instructions
**Steps:**
1. Enter in textarea: "Please ring doorbell twice"
2. Click "Save Preferences"

**Expected Results:**
- ✅ Instructions saved
- ✅ Text persists on page reload

---

## 4. Security Testing

### 4.1 Authentication Tests

#### Test Case 22: Access Without Login
**Steps:**
1. Logout from application
2. Try to access `/api/order-hub/orders` directly
3. Try to access Order Hub page

**Expected Results:**
- ✅ API returns 401 Unauthorized
- ✅ Frontend redirects to login page
- ✅ No data exposed

#### Test Case 23: Invalid Token
**Steps:**
1. Login normally
2. Modify JWT token in localStorage
3. Try to access Order Hub

**Expected Results:**
- ✅ API returns 401
- ✅ User redirected to login
- ✅ Token cleared

#### Test Case 24: Suspended Account
**Steps:**
1. Admin suspends customer account
2. Try to login
3. Try to access with existing valid token

**Expected Results:**
- ✅ Login blocked with 403
- ✅ API calls blocked with 403
- ✅ Error message: "Your account is suspended"

---

### 4.2 Authorization Tests

#### Test Case 25: Customer Cannot Access Agent Functions
**Steps:**
1. Login as Customer
2. Try to update parcel status (agent function)
3. Verify API call to `/api/order-hub/orders/:id/status`

**Expected Results:**
- ✅ API returns 403 Forbidden
- ✅ Error message indicates required role
- ✅ No data modified

#### Test Case 26: Agent Cannot Create External Orders
**Steps:**
1. Login as Agent
2. Try to create external order

**Expected Results:**
- ✅ API returns 403
- ✅ Button/form not visible in UI for agents

---

### 4.3 Data Isolation Tests

#### Test Case 27: Customer A Cannot See Customer B's Orders
**Steps:**
1. Login as Customer 1
2. Create test order
3. Note order ID
4. Logout
5. Login as Customer 2
6. Try to access Customer 1's order via API
7. View Order Hub dashboard

**Expected Results:**
- ✅ Customer 2 sees only their own orders
- ✅ Customer 1's orders not visible
- ✅ Direct API call returns 404 or empty
- ✅ Stats reflect only Customer 2's data

#### Test Case 28: Notifications Isolation
**Steps:**
1. Trigger notification for Customer 1
2. Login as Customer 2
3. View notifications

**Expected Results:**
- ✅ Customer 2 sees only their notifications
- ✅ Customer 1's notifications not visible
- ✅ Unread count accurate per customer

#### Test Case 29: Returns Isolation
**Steps:**
1. Customer 1 creates return request
2. Login as Customer 2
3. View returns page

**Expected Results:**
- ✅ Customer 2 sees only their returns
- ✅ Customer 1's returns not visible

---

### 4.4 Input Validation Tests

#### Test Case 30: SQL Injection Prevention
**Steps:**
1. Try to create order with payload:
   - Product Name: `'; DROP TABLE orders; --`
   - Order ID: `1' OR '1'='1`

**Expected Results:**
- ✅ Input sanitized or rejected
- ✅ No database errors
- ✅ No unauthorized data access

#### Test Case 31: XSS Prevention
**Steps:**
1. Try to create order with:
   - Product Name: `<script>alert('XSS')</script>`
   - Description: `<img src=x onerror=alert(1)>`

**Expected Results:**
- ✅ Script tags not executed
- ✅ HTML encoded properly
- ✅ No JavaScript alerts trigger

#### Test Case 32: Missing Required Fields
**Steps:**
1. Try to create order without product name
2. Try to create return without reason

**Expected Results:**
- ✅ API returns 422 Unprocessable Entity
- ✅ Error message indicates missing fields
- ✅ Frontend validation prevents submission

---

## 5. Real-Time Updates Testing

### 5.1 SSE Connection Tests

#### Test Case 33: Establish Real-Time Connection
**Steps:**
1. Login as Customer
2. Navigate to Order Hub
3. Open browser DevTools > Network
4. Look for `realtime/stream` EventSource connection

**Expected Results:**
- ✅ "Live" indicator shows green with Wifi icon
- ✅ SSE connection established successfully
- ✅ Connected event received
- ✅ Periodic ping events visible

#### Test Case 34: Reconnect After Disconnect
**Steps:**
1. Establish connection
2. Disconnect network
3. Reconnect network
4. Wait for auto-reconnect

**Expected Results:**
- ✅ "Live" indicator turns gray/offline
- ✅ Auto-reconnect attempts occur
- ✅ Connection restored when network available
- ✅ No errors in console

---

### 5.2 Real-Time Event Tests

#### Test Case 35: Order Status Update
**Steps:**
1. Customer 1 logged in with Order Hub open
2. Agent updates order status (via agent portal)
3. Observe Customer 1's dashboard

**Expected Results:**
- ✅ Order status updates immediately (no refresh needed)
- ✅ Real-time notification received
- ✅ Dashboard stats update automatically
- ✅ "Live" indicator confirms connection

#### Test Case 36: Return Status Update
**Steps:**
1. Customer has pending return request
2. Admin approves return
3. Observe customer's returns page

**Expected Results:**
- ✅ Return status changes from "requested" to "approved"
- ✅ Real-time notification shows approval
- ✅ Stats update automatically
- ✅ No page refresh required

#### Test Case 37: New Notification
**Steps:**
1. Customer viewing Order Hub
2. Trigger notification (via backend or admin action)
3. Observe notification center

**Expected Results:**
- ✅ Unread count badge increments
- ✅ Notification appears in list without refresh
- ✅ Visual/audio alert (if implemented)
- ✅ Real-time event logged in DevTools

#### Test Case 38: Multi-Tab Sync
**Steps:**
1. Open Order Hub in two browser tabs
2. Trigger status update in backend
3. Observe both tabs

**Expected Results:**
- ✅ Both tabs receive update simultaneously
- ✅ Both tabs show updated data
- ✅ Two SSE connections visible in Network tab

---

## 6. Integration Testing

### 6.1 Agent-Customer Integration

#### Test Case 39: Agent Updates Parcel Status
**Steps:**
1. Customer 1 has SwiftRoute parcel
2. Agent updates status to "out_for_delivery"
3. Customer 1 viewing Order Hub

**Expected Results:**
- ✅ Customer sees real-time update
- ✅ Parcel status changes in Order Hub
- ✅ Notification created for customer
- ✅ Stats reflect new status

#### Test Case 40: Agent Delivers Parcel
**Steps:**
1. Agent marks parcel as "delivered"
2. Agent uploads delivery proof
3. Customer views order details

**Expected Results:**
- ✅ Status updates to "delivered"
- ✅ Delivery proof visible
- ✅ Delivered count increments in stats
- ✅ Notification sent to customer

---

### 6.2 Platform Integration

#### Test Case 41: Mixed Orders Display
**Steps:**
1. Customer has:
   - 2 SwiftRoute parcels
   - 3 Amazon orders
   - 1 Flipkart order
2. View Order Hub

**Expected Results:**
- ✅ All orders display in unified list
- ✅ Platform badges show correct icons/colors
- ✅ Filter by platform works for all types
- ✅ Total orders count = 6

---

## 7. UI/UX Testing

### 7.1 Visual Design Tests

#### Test Case 42: Responsive Design
**Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768px width)
3. Test on mobile (375px width)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ Touch targets appropriately sized
- ✅ All features accessible on mobile

#### Test Case 43: Dark Mode (if implemented)
**Steps:**
1. Toggle dark mode
2. Navigate through all pages

**Expected Results:**
- ✅ All components support dark mode
- ✅ Colors meet contrast requirements
- ✅ Gradients work in dark mode

### 7.2 Usability Tests

#### Test Case 44: Navigation Flow
**Steps:**
1. Start at Order Hub
2. Navigate to each section:
   - Returns
   - Notifications
   - Analytics
   - Preferences
   - Back to Order Hub

**Expected Results:**
- ✅ Navigation clear and intuitive
- ✅ Active nav item highlighted
- ✅ Breadcrumbs show current location
- ✅ No broken links

#### Test Case 45: Loading States
**Steps:**
1. Refresh Order Hub page
2. Observe loading behavior

**Expected Results:**
- ✅ Skeleton loaders display
- ✅ No content flash
- ✅ Smooth transition to loaded state
- ✅ Loading indicators for API calls

#### Test Case 46: Empty States
**Steps:**
1. New customer with no orders
2. View each section

**Expected Results:**
- ✅ Friendly empty state messages
- ✅ Clear call-to-action
- ✅ Helpful instructions
- ✅ No error messages

#### Test Case 47: Error Handling
**Steps:**
1. Disconnect network
2. Try to create order
3. Reconnect and retry

**Expected Results:**
- ✅ Error message displayed
- ✅ No app crash
- ✅ Retry option available
- ✅ Success after reconnect

---

## 8. Performance Testing

### 8.1 Load Testing

#### Test Case 48: Large Dataset
**Steps:**
1. Create 100+ orders for customer
2. Load Order Hub
3. Test filters and search

**Expected Results:**
- ✅ Page loads within 3 seconds
- ✅ Scrolling remains smooth
- ✅ Filters respond instantly
- ✅ No browser freezing

#### Test Case 49: Real-Time Stress Test
**Steps:**
1. Open 10 browser tabs as same customer
2. Trigger multiple rapid status updates

**Expected Results:**
- ✅ All tabs receive updates
- ✅ No connection drops
- ✅ Server handles multiple SSE connections
- ✅ No memory leaks

---

## 9. Bug Reporting

### Bug Report Template
When reporting bugs, include:

```markdown
**Bug Title:** [Short descriptive title]

**Priority:** [Critical/High/Medium/Low]

**Environment:**
- Browser: [Chrome 120/Firefox 119/Safari 17]
- OS: [Windows 11/macOS 14/Ubuntu 22]
- Screen Size: [1920x1080]

**Steps to Reproduce:**
1. Login as customer
2. Navigate to Order Hub
3. Click "Add Order"
4. [specific action]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach screenshots if applicable]

**Console Errors:**
```
[Any errors from browser console]
```

**Additional Context:**
[Any other relevant information]
```

---

## 10. Test Completion Checklist

### Functional Tests
- [ ] Dashboard displays correctly
- [ ] Add external order works
- [ ] Import tracking number works
- [ ] Filters and search work
- [ ] Sort functionality works
- [ ] View modes (table/grid) work
- [ ] Order details display correctly
- [ ] Returns management works
- [ ] Notifications system works
- [ ] Analytics display correctly
- [ ] Delivery preferences save correctly

### Security Tests
- [ ] Authentication required for all endpoints
- [ ] Customer A cannot access Customer B's data
- [ ] Role-based authorization enforced
- [ ] Input validation prevents injection
- [ ] Suspended accounts blocked

### Real-Time Tests
- [ ] SSE connection establishes
- [ ] Order updates received in real-time
- [ ] Return updates received in real-time
- [ ] Notifications arrive instantly
- [ ] Multi-tab sync works

### UI/UX Tests
- [ ] Responsive on all screen sizes
- [ ] Loading states display correctly
- [ ] Empty states are user-friendly
- [ ] Error handling works properly
- [ ] Navigation is intuitive

### Performance Tests
- [ ] Handles 100+ orders efficiently
- [ ] Real-time updates don't cause lag
- [ ] No memory leaks detected

---

## Test Results Summary

**Date Tested:** _____________  
**Tester Name:** _____________  
**Total Tests:** 49  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___

**Overall Status:** [ ] PASS [ ] FAIL [ ] NEEDS REVIEW

**Comments:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Document Version:** 1.0.0  
**Last Updated:** October 2, 2026
