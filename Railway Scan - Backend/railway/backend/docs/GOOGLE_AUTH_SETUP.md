# Google OAuth Integration Guide

## Overview

RailTrack AI supports seamless authentication with both Google OAuth and traditional email/password. Users can:
- Sign in with Google (first time creates account)
- Sign in with email/password (if password is set)
- Switch between both methods using the same account
- Set a password later if they initially signed up with Google

## How It Works

### Scenario 1: First-time Google Sign-in
1. User clicks "Continue with Google"
2. Google authentication completes
3. New account created with Google ID
4. User can now sign in with Google anytime

### Scenario 2: Google User Sets Password
1. User signed up with Google
2. User sets a password via `/api/v1/auth/set-password`
3. Account now supports both Google and email/password login
4. User can use either method interchangeably

### Scenario 3: Email User Links Google
1. User registered with email/password
2. User signs in with Google using same email
3. Google ID automatically linked to existing account
4. User can now use both methods

### Scenario 4: Existing Email User Tries Google
1. User has account with email/password
2. User clicks "Continue with Google" with same email
3. System automatically links Google account
4. Both methods now work for same account

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - Application name: RailTrack AI
   - User support email: your-email@railtrack.gov.in
   - Authorized domains: railtrack.gov.in
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: RailTrack AI Backend
   - Authorized JavaScript origins:
     - `http://localhost:5000` (development)
     - `https://api.railtrack.gov.in` (production)
   - Authorized redirect URIs:
     - `http://localhost:5000/api/v1/auth/google/callback` (development)
     - `https://api.railtrack.gov.in/api/v1/auth/google/callback` (production)
7. Copy Client ID and Client Secret

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

Dependencies added:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management
- `google-auth-library` - Google token verification

## API Endpoints

### 1. Google Login (Token-based)

**Recommended for SPAs and Mobile Apps**

```bash
POST /api/v1/auth/google
Content-Type: application/json

{
  "token": "google-id-token-from-client"
}
```

Response:
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "googleId": "...",
      "authProvider": "google",
      "profilePicture": "https://...",
      "role": "VENDOR"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Google OAuth Redirect (Server-side)

**For traditional web apps**

```bash
# Step 1: Redirect user to Google
GET /api/v1/auth/google/redirect

# Step 2: Google redirects back to callback
GET /api/v1/auth/google/callback
# Automatically redirects to frontend with tokens
```

### 3. Set Password (for Google users)

```bash
POST /api/v1/auth/set-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "newPassword": "SecurePass@123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password set successfully",
  "data": null
}
```

### 4. Regular Login (works after password is set)

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

## Frontend Integration

### React Example (Token-based)

```javascript
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="your-client-id">
      <div>
        <h1>Login</h1>
        
        {/* Google Login Button */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Failed')}
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
        />
        
        {/* OR */}
        
        {/* Traditional Login Form */}
        <form onSubmit={handleEmailLogin}>
          <input type="email" name="email" placeholder="Email" />
          <input type="password" name="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </div>
    </GoogleOAuthProvider>
  );
}
```

### HTML Example (Redirect-based)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Login - RailTrack AI</title>
</head>
<body>
  <h1>Login</h1>
  
  <!-- Google Login Button -->
  <a href="http://localhost:5000/api/v1/auth/google/redirect">
    <button>Continue with Google</button>
  </a>
  
  <!-- OR -->
  
  <!-- Email/Password Form -->
  <form action="/login" method="POST">
    <input type="email" name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Login</button>
  </form>
</body>
</html>
```

### Callback Handler (Frontend)

```javascript
// Handle OAuth callback redirect
// URL: http://localhost:3000/auth/callback?accessToken=...&refreshToken=...

const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('accessToken');
const refreshToken = urlParams.get('refreshToken');

if (accessToken && refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  window.location.href = '/dashboard';
}
```

## User Flow Diagrams

### Flow 1: New User with Google

```
User clicks "Continue with Google"
    ↓
Google authentication
    ↓
Backend receives Google profile
    ↓
Check if email exists → NO
    ↓
Create new user with:
  - email from Google
  - googleId
  - authProvider: 'google'
  - no password
    ↓
Return tokens
    ↓
User logged in
```

### Flow 2: Google User Sets Password

```
User logged in with Google
    ↓
User wants to set password
    ↓
POST /api/v1/auth/set-password
    ↓
Backend sets password
    ↓
authProvider: 'google' → 'both'
    ↓
User can now use both methods
```

### Flow 3: Existing Email User Uses Google

```
User has account with email/password
    ↓
User clicks "Continue with Google"
    ↓
Google authentication
    ↓
Backend receives Google profile
    ↓
Check if email exists → YES
    ↓
Link Google ID to existing account
    ↓
authProvider: 'local' → 'both'
    ↓
Return tokens
    ↓
User logged in (same account)
```

## Database Schema

### User Model Fields

```javascript
{
  email: String,              // Primary identifier
  password: String,           // Optional (not required for Google-only users)
  googleId: String,           // Google user ID
  authProvider: String,       // 'local', 'google', or 'both'
  profilePicture: String,     // From Google profile
  name: String,
  role: String,
  // ... other fields
}
```

### Auth Provider States

- `local`: User registered with email/password only
- `google`: User registered with Google only (no password)
- `both`: User can use both Google and email/password

## Security Considerations

1. **Token Verification**: Google tokens are verified server-side
2. **Email Verification**: Only verified Google emails are accepted
3. **Google ID Matching**: Prevents account hijacking
4. **Password Optional**: Google-only users don't need passwords
5. **Seamless Linking**: Automatic account linking by email
6. **Audit Logging**: All Google logins are logged

## Error Handling

### Common Errors

1. **Invalid Google Token**
```json
{
  "success": false,
  "message": "Invalid Google token",
  "error": { "code": "AUTHENTICATION_ERROR" }
}
```

2. **Email Not Verified**
```json
{
  "success": false,
  "message": "Email not verified with Google",
  "error": { "code": "VALIDATION_ERROR" }
}
```

3. **Google ID Mismatch**
```json
{
  "success": false,
  "message": "This email is already associated with a different Google account",
  "error": { "code": "AUTHENTICATION_ERROR" }
}
```

4. **Password Already Set**
```json
{
  "success": false,
  "message": "Password already set. Use change password instead.",
  "error": { "code": "VALIDATION_ERROR" }
}
```

5. **Google-only Account Login Attempt**
```json
{
  "success": false,
  "message": "This account was created with Google. Please use 'Continue with Google' or set a password first.",
  "error": { "code": "AUTHENTICATION_ERROR" }
}
```

## Testing

### Test Scenario 1: New Google User

```bash
# 1. Get Google ID token from frontend
# 2. Login with Google
curl -X POST http://localhost:5000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google-id-token"}'

# 3. Verify user created
# 4. Try email/password login (should fail - no password)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmail.com", "password": "any"}'
# Expected: Error message about Google-only account
```

### Test Scenario 2: Set Password

```bash
# 1. Login with Google (get access token)
# 2. Set password
curl -X POST http://localhost:5000/api/v1/auth/set-password \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "SecurePass@123"}'

# 3. Try email/password login (should work now)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmail.com", "password": "SecurePass@123"}'
```

### Test Scenario 3: Link Google to Existing Account

```bash
# 1. Register with email/password
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "Test@1234",
    "role": "VENDOR"
  }'

# 2. Login with Google using same email
curl -X POST http://localhost:5000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google-id-token-with-test@gmail.com"}'

# 3. Verify both methods work
# 4. Check authProvider changed to 'both'
```

## Production Checklist

- [ ] Update Google OAuth credentials for production domain
- [ ] Set production callback URL
- [ ] Configure CORS for frontend domain
- [ ] Set secure session secret
- [ ] Enable HTTPS for OAuth
- [ ] Test all authentication flows
- [ ] Monitor Google API quotas
- [ ] Set up error alerting
- [ ] Document user flows for support team

## Troubleshooting

### Issue: "Google OAuth not configured"
**Solution**: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Issue: "Redirect URI mismatch"
**Solution**: Ensure callback URL in Google Console matches `GOOGLE_CALLBACK_URL`

### Issue: "Invalid token"
**Solution**: Verify token is fresh (expires in 1 hour) and client ID matches

### Issue: "Session not persisting"
**Solution**: Check `SESSION_SECRET` is set and cookies are enabled

## Support

For Google OAuth issues:
- Email: auth-support@railtrack.gov.in
- Documentation: https://docs.railtrack.gov.in/auth
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2

---

**Last Updated**: March 2026  
**Version**: 1.0.0
