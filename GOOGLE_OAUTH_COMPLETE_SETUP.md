# Google OAuth Setup Guide - Complete Implementation

## ✅ What Has Been Fixed

Your Google OAuth implementation has been corrected with the following changes:

1. **Backend Callback URL** - Fixed to point to `http://localhost:3000/api/auth/google/callback`
2. **Configuration Files** - Updated `.env.example` and `.env` with correct URLs
3. **OAuth Flow** - Properly configured to:
   - Redirect to Google for authentication
   - Show Google account selection
   - Store user information in database
   - Return to frontend with JWT token

---

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one
   - Name it something like "SwiftRoute Logistics"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: `SwiftRoute Enterprise`
     - User support email: Your email
     - Developer contact email: Your email
   - Add scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Add test users (your Google account email)
   - Save and continue

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `SwiftRoute Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click "Create"
   - **IMPORTANT**: Copy the Client ID and Client Secret

### Step 2: Update Your .env File

Open your `.env` file and add the credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="YOUR_ACTUAL_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_ACTUAL_CLIENT_SECRET_HERE"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
```

Replace `YOUR_ACTUAL_CLIENT_ID_HERE` and `YOUR_ACTUAL_CLIENT_SECRET_HERE` with the values from Google Cloud Console.

### Step 3: Start Your Application

```bash
# Start the server
npm run dev
```

---

## 🔄 How the OAuth Flow Works

### 1. User Clicks "Continue with Google" Button
- Frontend redirects to: `http://localhost:3000/api/auth/google`

### 2. Backend Redirects to Google
- Server redirects user to Google's login page
- User sees Google account selection
- User chooses an account and authorizes

### 3. Google Redirects Back to Your App
- Google redirects to: `http://localhost:3000/api/auth/google/callback`
- Includes authorization code in URL

### 4. Backend Processes Authentication
- Exchanges authorization code for user profile
- Checks if user exists in database (by email)
- If exists: Returns existing user
- If new: Creates new user with:
  ```javascript
  {
    full_name: "From Google Profile",
    email: "user@gmail.com",
    role: "customer",
    status: "active",
    google_id: "Google User ID"
  }
  ```

### 5. Backend Generates JWT and Redirects
- Creates JWT token with user info
- Redirects to: `http://localhost:5173?token=JWT_TOKEN_HERE`

### 6. Frontend Stores Token
- Extracts token from URL
- Stores in localStorage
- Redirects to dashboard

---

## 📁 Files Modified

### ✅ Backend Files
1. **`backend/config/index.ts`** - Updated default callback URL
2. **`.env.example`** - Fixed callback URL template
3. **`.env`** - Added Google OAuth configuration

### ✅ Passport Configuration (`backend/config/passport.ts`)
Already correctly configured to:
- Extract email and name from Google profile
- Check for existing users
- Create new users automatically
- Store in database via `db.insert('users', newUser)`

### ✅ Auth Routes (`backend/routes/authRoutes.ts`)
- `/api/auth/google` - Initiates OAuth flow
- `/api/auth/google/callback` - Handles Google callback

### ✅ Auth Controller (`backend/controllers/authController.ts`)
- `googleCallback` - Generates JWT and redirects with token

### ✅ Frontend (`src/pages/AuthPage.tsx`)
Already handles:
- OAuth redirect to backend
- Token extraction from URL
- Token storage
- Error handling

---

## 🧪 Testing the OAuth Flow

### Test Steps:

1. **Start your backend** (port 3000):
   ```bash
   npm run dev
   ```

2. **Open frontend** in browser:
   ```
   http://localhost:5173
   ```

3. **Click "Sign in with Google"** button

4. **Expected Flow**:
   - ✅ Redirects to Google login
   - ✅ Shows your Google accounts
   - ✅ After selection, asks for permission
   - ✅ Redirects back to your app
   - ✅ Shows dashboard (logged in)

5. **Check Database**:
   - Open your database
   - Look in `users` table
   - Should see new user with:
     - Email from Google
     - Name from Google
     - `google_id` field populated
     - Empty `password_hash` (OAuth users don't need passwords)
     - Role: `customer`

---

## 🔍 Debugging

### If OAuth Doesn't Work:

#### 1. Check Console Errors
Open browser DevTools (F12) and check Console tab for errors

#### 2. Verify Environment Variables
```bash
# In your terminal, check if variables are loaded
npm run dev
# Server should log the port (3000)
```

#### 3. Check Google Console Settings
- Authorized redirect URIs must exactly match:
  ```
  http://localhost:3000/api/auth/google/callback
  ```
- No trailing slashes
- Correct protocol (http for localhost)

#### 4. Common Errors:

**"redirect_uri_mismatch"**
- Solution: Add `http://localhost:3000/api/auth/google/callback` to Google Console authorized redirect URIs

**"access_denied"**
- Solution: Make sure you added your email as a test user in OAuth consent screen

**"No email found in Google profile"**
- Solution: Make sure you added the email scope in OAuth consent screen

#### 5. Check Backend Logs
Watch the terminal where your server is running for any errors

---

## 🔐 Security Notes

### Current Implementation:
- ✅ Uses secure JWT tokens
- ✅ Session middleware configured
- ✅ CORS properly configured
- ✅ Password not required for OAuth users
- ✅ User data properly sanitized

### For Production:
1. **Update callback URLs** to production domain
2. **Enable HTTPS** (required by Google for production)
3. **Set secure cookies** (`secure: true` in production)
4. **Update CORS** to specific origin (not `*`)
5. **Add rate limiting** for auth endpoints
6. **Verify OAuth consent screen** is published

---

## 📊 Database Schema

Users created via Google OAuth will have:

```typescript
{
  id: "usr_1234567890_abcd",           // Auto-generated
  full_name: "John Doe",                // From Google
  email: "john@gmail.com",              // From Google
  password_hash: "",                     // Empty for OAuth users
  google_id: "1234567890",              // Google's user ID
  role: "customer",                      // Default role
  phone: "",                             // Empty (can be updated later)
  address: "",                           // Empty (can be updated later)
  status: "active",                      // Active by default
  created_at: "2026-09-22T...",         // Timestamp
  updated_at: "2026-09-22T..."          // Timestamp
}
```

---

## 🎉 You're All Set!

Once you add your Google OAuth credentials to `.env`, the flow should work perfectly:

1. Click "Continue with Google"
2. Select your Google account
3. Authorize the app
4. Redirected to dashboard
5. User saved in database

Need help? Check the debugging section above or review the backend logs.
