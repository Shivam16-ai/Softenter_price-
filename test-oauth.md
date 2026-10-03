# Testing Google OAuth - Quick Checklist

## ✅ Pre-Flight Checklist

Before testing, ensure:

1. **Google OAuth credentials are set in `.env`**:
   ```bash
   # Open .env and verify these are filled in:
   GOOGLE_CLIENT_ID="your-actual-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
   ```

2. **Google Cloud Console is configured**:
   - OAuth consent screen created
   - Your email added as test user
   - Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

3. **Server is running**:
   ```bash
   npm run dev
   ```

---

## 🧪 Test Steps

### 1. Open the App
Navigate to: `http://localhost:5173`

### 2. Click "Sign in with Google"
Look for the Google button (has Google logo with colorful icon)

### 3. Verify Redirect Flow
You should see:
- ✅ Browser redirects to `accounts.google.com`
- ✅ Google account selection page appears
- ✅ Can choose which email to use

### 4. Authorize the App
- ✅ Shows "SwiftRoute Enterprise wants to access your Google Account"
- ✅ Lists permissions: email and profile
- Click "Continue" or "Allow"

### 5. Redirect Back to App
- ✅ URL briefly shows: `http://localhost:5173?token=...`
- ✅ Token is extracted and stored
- ✅ Redirected to dashboard
- ✅ You're logged in!

### 6. Verify in Database
Check that user was created:

**Option A: View datastore.json**
```bash
# Open this file:
backend/database/datastore.json

# Look for new user with:
# - Your Google email
# - Your Google name
# - google_id field present
# - password_hash is empty string
# - role is "customer"
```

**Option B: Check via API (if logged in)**
```bash
# In browser console (F12):
console.log(localStorage.getItem('token'));
```

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution**: 
1. Go to Google Cloud Console
2. APIs & Services > Credentials
3. Click your OAuth client
4. Under "Authorized redirect URIs", add exactly:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Save and try again

### Issue: "access_denied" or "unauthorized_client"
**Solution**:
1. Go to OAuth consent screen
2. Add your email under "Test users"
3. Save and try again

### Issue: Redirects but shows error page
**Check browser console** (F12):
- Look for errors in Console tab
- Check Network tab for failed requests

**Check backend logs**:
- Look at terminal where `npm run dev` is running
- Should show the request coming in

### Issue: "No email found in Google profile"
**Solution**:
1. OAuth consent screen > Scopes
2. Verify these are added:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`

### Issue: Token not being stored
**Check**:
1. Open browser console (F12)
2. Run: `localStorage.getItem('token')`
3. Should return a JWT string (long encoded text)
4. If null, check AuthContext implementation

---

## 📊 What Should Happen Behind the Scenes

### Backend Logs (Terminal)
You should see:
```
GET /api/auth/google
GET /api/auth/google/callback?code=...
```

### Network Requests (Browser DevTools > Network)
1. `http://localhost:3000/api/auth/google` (302 redirect)
2. `https://accounts.google.com/...` (Google login)
3. `http://localhost:3000/api/auth/google/callback?code=...` (302 redirect)
4. `http://localhost:5173?token=...` (frontend with token)

### Database Changes
New entry in `backend/database/datastore.json`:
```json
{
  "id": "usr_1234567890_abcd",
  "full_name": "Your Name from Google",
  "email": "youremail@gmail.com",
  "password_hash": "",
  "google_id": "123456789012345678901",
  "role": "customer",
  "phone": "",
  "address": "",
  "status": "active",
  "created_at": "2026-09-22T...",
  "updated_at": "2026-09-22T..."
}
```

---

## ✨ Success Indicators

### You're Successfully Logged In When:
- ✅ URL is `http://localhost:5173` (no token in URL)
- ✅ Dashboard is visible
- ✅ User menu shows your Google name
- ✅ Can navigate through the app
- ✅ Token is in localStorage
- ✅ User record exists in database

### To Verify Logout Works:
1. Click logout button
2. Should redirect to auth page
3. Token removed from localStorage
4. Can't access dashboard without logging in again

---

## 🔄 Test Again (Fresh Login)

To test with a different account or re-test:

1. **Logout** from the app
2. **Clear browser cache** (or use incognito mode)
3. **Try logging in again** with same or different Google account

Second login with **same email**:
- Should find existing user in database
- Should NOT create duplicate user
- Should still log in successfully

Second login with **different email**:
- Should create new user record
- Each email gets separate account

---

## 📝 Notes

- **First-time users**: Automatically get `role: "customer"`
- **OAuth users**: Have empty `password_hash` (they login via Google)
- **Security**: JWT expires in 7 days (configured in backend)
- **Privacy**: Only email and name are stored from Google
- **Data**: Users can update phone/address after signup

---

## Need Help?

If OAuth still doesn't work after following these steps:

1. Check `GOOGLE_OAUTH_COMPLETE_SETUP.md` for detailed setup
2. Verify ALL steps in Google Cloud Console
3. Check backend terminal for error messages
4. Check browser console for JavaScript errors
5. Try incognito mode to rule out cache issues
