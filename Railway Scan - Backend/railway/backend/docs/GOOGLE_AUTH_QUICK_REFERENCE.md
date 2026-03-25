# Google OAuth - Quick Reference

## 🚀 Quick Setup (5 Minutes)

### 1. Get Google Credentials
```
1. Go to https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth 2.0 Client ID
4. Copy Client ID and Secret
```

### 2. Configure Environment
```bash
# Add to .env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
SESSION_SECRET=random-secret-key
FRONTEND_URL=http://localhost:3000
```

### 3. Install & Run
```bash
npm install
docker-compose up --build
```

## 📡 API Endpoints

### Google Login (Token-based) - Recommended
```bash
POST /api/v1/auth/google
Content-Type: application/json

{
  "token": "google-id-token-from-frontend"
}
```

### Google OAuth Redirect (Server-side)
```bash
GET /api/v1/auth/google/redirect
# Redirects to Google
# Returns to /api/v1/auth/google/callback
```

### Set Password (for Google users)
```bash
POST /api/v1/auth/set-password
Authorization: Bearer <token>

{
  "newPassword": "SecurePass@123"
}
```

### Regular Login (works after password set)
```bash
POST /api/v1/auth/login

{
  "email": "user@gmail.com",
  "password": "SecurePass@123"
}
```

## 🔄 User Flows

### Flow 1: New Google User
```
Click "Continue with Google" → Account created → Login successful
✅ Can use Google anytime
❌ Cannot use email/password (no password yet)
```

### Flow 2: Set Password
```
Google user → Set password → Can use both methods
✅ Can use Google
✅ Can use email/password
```

### Flow 3: Link Accounts
```
Email user → Sign in with Google (same email) → Accounts linked
✅ Can use Google
✅ Can use email/password
```

## 💻 Frontend Code

### React (Token-based)
```javascript
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async (response) => {
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential })
    });
    const data = await res.json();
    localStorage.setItem('accessToken', data.data.accessToken);
  }}
  text="continue_with"
/>
```

### HTML (Redirect-based)
```html
<a href="http://localhost:5000/api/v1/auth/google/redirect">
  <button>Continue with Google</button>
</a>
```

## 🗄️ Database Fields

```javascript
{
  email: "user@gmail.com",
  password: "hashed" or undefined,
  googleId: "123456789",
  authProvider: "local" | "google" | "both",
  profilePicture: "https://..."
}
```

## 🔐 Auth Provider States

| State | Has Password | Has Google ID | Can Login With |
|-------|--------------|---------------|----------------|
| `local` | ✅ | ❌ | Email + Password |
| `google` | ❌ | ✅ | Google |
| `both` | ✅ | ✅ | Email + Password OR Google |

## ⚠️ Common Errors

### "Invalid Google token"
- Token expired (1 hour lifetime)
- Wrong client ID
- Token from different app

### "Email not verified"
- User's Google email not verified
- Ask user to verify email in Google

### "This account was created with Google"
- User trying email/password login
- No password set yet
- Use Google or set password first

### "Password already set"
- Trying to set password again
- Use change password instead

## 🧪 Testing

```bash
# Test Google user creation
curl -X POST http://localhost:5000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google-id-token"}'

# Test set password
curl -X POST http://localhost:5000/api/v1/auth/set-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "NewPass@123"}'

# Test email login (after password set)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmail.com", "password": "NewPass@123"}'
```

## 📋 Checklist

Setup:
- [ ] Google OAuth credentials created
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Server running

Testing:
- [ ] Google login works
- [ ] Account created/linked
- [ ] Set password works
- [ ] Email login works after password set
- [ ] Both methods access same account

Production:
- [ ] Production callback URL configured
- [ ] HTTPS enabled
- [ ] Session secret changed
- [ ] CORS configured for frontend

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Google OAuth not configured" | Set GOOGLE_CLIENT_ID in .env |
| "Redirect URI mismatch" | Update callback URL in Google Console |
| "Session not persisting" | Set SESSION_SECRET in .env |
| "CORS error" | Add frontend URL to CORS config |

## 📚 Full Documentation

- **Setup Guide**: [GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md)
- **Implementation**: [GOOGLE_OAUTH_IMPLEMENTATION.md](GOOGLE_OAUTH_IMPLEMENTATION.md)
- **API Guide**: [API_GUIDE.md](docs/API_GUIDE.md)

## 🎯 Key Points

1. ✅ Same email = same account (always)
2. ✅ Google and email/password are interchangeable
3. ✅ Automatic account linking by email
4. ✅ Google users can set password anytime
5. ✅ Email users can link Google anytime
6. ✅ No data loss, seamless sync

---

**Need Help?** See [GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md) for detailed guide.
