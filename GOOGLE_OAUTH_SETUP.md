# Google OAuth Setup Guide

This guide explains how to configure Google OAuth authentication for SwiftRoute Enterprise Parcel Management System.

## Features Added

✅ **Google Sign-In on Login Page** - Users can sign in with their Google account  
✅ **Google Sign-Up on Register Page** - New users can create accounts using Google  
✅ **Automatic Account Creation** - First-time Google users get customer accounts automatically  
✅ **Secure Token-Based Auth** - JWT tokens for authenticated sessions  
✅ **Session Management** - Express sessions with Passport.js

## Prerequisites

1. A Google Cloud Platform account
2. Node.js and npm installed
3. SwiftRoute application running locally

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click **"New Project"**
3. Enter project name: `SwiftRoute Logistics`
4. Click **"Create"**

### 1.3 Enable Google+ API
1. In the left sidebar, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (or Internal if using Google Workspace)
   - App name: `SwiftRoute Enterprise`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Scopes: Add `email` and `profile` scopes
   - Click **"Save and Continue"**
   - Test users: Add your email for testing
   - Click **"Save and Continue"**

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `SwiftRoute Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click **"Create"**

5. **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Configure Environment Variables

1. Open your `.env` file in the project root (or create it from `.env.example`):

```bash
cp .env.example .env
```

2. Add your Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Session Secret (change this to a random string)
SESSION_SECRET="your-super-secret-session-key-change-this"
```

3. **Important**: Never commit your `.env` file to version control!

## Step 3: Install Dependencies

Dependencies have already been installed. If you need to reinstall:

```bash
npm install passport passport-google-oauth20 @types/passport @types/passport-google-oauth20 express-session @types/express-session
```

## Step 4: Start the Application

```bash
npm run dev
```

The server should start on `http://localhost:3000` and the frontend on `http://localhost:5173`.

## Step 5: Test Google OAuth

1. Navigate to `http://localhost:5173` in your browser
2. Click on **"Get Started"** or **"Sign In"**
3. You'll see the new Google Sign-In buttons:
   - **"Sign in with Google"** on the login tab
   - **"Sign up with Google"** on the register tab
4. Click the Google button
5. You'll be redirected to Google's login page
6. Select your Google account
7. Grant permissions
8. You'll be redirected back to SwiftRoute and automatically logged in!

## How It Works

### Backend Flow

1. **Route**: `/api/auth/google` - Initiates OAuth flow
2. **Passport Strategy**: Handles Google authentication
3. **Callback**: `/api/auth/google/callback` - Processes Google response
4. **User Creation**: New users are automatically created with:
   - Email from Google
   - Full name from Google profile
   - Default role: `customer`
   - No password (OAuth users don't need passwords)
5. **JWT Token**: Generated and sent back to frontend
6. **Redirect**: User redirected to dashboard

### Frontend Flow

1. User clicks "Sign in with Google"
2. Redirected to `http://localhost:3000/api/auth/google`
3. Google OAuth flow completes
4. User redirected back with token: `http://localhost:5173?token=<jwt>`
5. Frontend extracts token, stores it, and fetches user data
6. User is logged in and redirected to dashboard

## Security Considerations

### Production Setup

When deploying to production, update these URLs:

1. **In Google Cloud Console**:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

2. **In `.env` file**:
   ```env
   GOOGLE_CALLBACK_URL="https://yourdomain.com/api/auth/google/callback"
   SESSION_SECRET="use-a-very-long-random-string-here"
   ```

3. **Update frontend OAuth callback** in `authController.ts`:
   ```typescript
   res.redirect(`https://yourdomain.com?token=${token}`);
   ```

### Best Practices

✅ Use HTTPS in production  
✅ Set secure cookie flags in production  
✅ Regularly rotate your session secret  
✅ Keep client secrets in environment variables  
✅ Add rate limiting to OAuth endpoints  
✅ Implement CSRF protection  
✅ Monitor failed authentication attempts

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google Console
- **Fix**: Ensure the callback URL in `.env` exactly matches the one in Google Console (including protocol, domain, port, and path)

### Error: "Access blocked: Authorization Error"
- **Cause**: OAuth consent screen not configured properly
- **Fix**: Complete the OAuth consent screen setup in Google Cloud Console

### Error: "Google authentication failed"
- **Cause**: User denied permissions or OAuth flow was interrupted
- **Fix**: Try again and make sure to grant all requested permissions

### Error: "No email found in Google profile"
- **Cause**: User's Google account doesn't have a public email
- **Fix**: Request email scope explicitly (already configured)

### Session Issues
- **Cause**: Session secret not set or changed
- **Fix**: Set a consistent `SESSION_SECRET` in your `.env` file

## Additional Features

### Linking Existing Accounts

If you want users to link their Google account to existing accounts, you can extend the OAuth callback:

```typescript
// In authController.ts
const existingUser = users.find(u => u.email === email);
if (existingUser) {
  // Update existing user with Google ID
  db.update('users', existingUser.id, { google_id: googleId });
}
```

### Role Assignment

Currently, all Google OAuth users get the `customer` role. To allow role selection:

1. Add a role selection step after Google login
2. Or map roles based on email domain:
   ```typescript
   const role = email.endsWith('@swiftroute.com') ? 'admin' : 'customer';
   ```

## Support

For issues or questions:
- Check the console for error messages
- Review the authentication flow in browser DevTools
- Ensure all environment variables are set correctly
- Verify Google Cloud Console configuration

## Files Modified

- `backend/config/index.ts` - Added Google OAuth config
- `backend/config/passport.ts` - **NEW** - Passport Google strategy
- `backend/controllers/authController.ts` - Added Google callback handler
- `backend/routes/authRoutes.ts` - Added Google OAuth routes
- `server.ts` - Added session and Passport middleware
- `src/pages/AuthPage.tsx` - Added Google Sign-In buttons
- `src/context/AuthContext.tsx` - Added setToken method
- `.env.example` - Added Google OAuth variables
- `package.json` - Added OAuth dependencies

---

**Last Updated**: January 2026  
**SwiftRoute Enterprise** - Parcel Management System
