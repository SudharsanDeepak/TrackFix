# 🔧 Environment Configuration Guide

## Quick Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Update Required Variables
Open `.env` and update these **REQUIRED** variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Start the Application
```bash
npm run dev
```

---

## 📋 Environment Variables Reference

### ✅ Required Variables

#### `VITE_API_BASE_URL`
- **Description:** Backend API base URL
- **Required:** YES
- **Default:** None
- **Development:** `http://localhost:5000/api/v1`
- **Production:** `https://your-api-domain.com/api/v1`

#### `VITE_GOOGLE_CLIENT_ID`
- **Description:** Google OAuth Client ID
- **Required:** YES (for Google login)
- **Default:** None
- **How to get:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Note:** Use placeholder if not implementing Google OAuth

---

### ⚙️ Optional Variables

#### Application Settings

**`VITE_APP_ENV`**
- **Description:** Application environment
- **Options:** `development`, `staging`, `production`
- **Default:** `development`

**`VITE_APP_NAME`**
- **Description:** Application name (displayed in UI)
- **Default:** `RailTrack AI`

**`VITE_APP_VERSION`**
- **Description:** Application version
- **Default:** `1.0.0`

#### Feature Flags

**`VITE_ENABLE_OFFLINE_MODE`**
- **Description:** Enable offline functionality
- **Options:** `true`, `false`
- **Default:** `false`

**`VITE_ENABLE_ANALYTICS`**
- **Description:** Enable analytics tracking
- **Options:** `true`, `false`
- **Default:** `false`

**`VITE_ENABLE_DEBUG`**
- **Description:** Enable debug mode (detailed logs)
- **Options:** `true`, `false`
- **Default:** `true` (development), `false` (production)

#### API Settings

**`VITE_API_TIMEOUT`**
- **Description:** API request timeout (milliseconds)
- **Default:** `10000` (10 seconds)

**`VITE_RETRY_ATTEMPTS`**
- **Description:** Number of retry attempts for failed requests
- **Default:** `3`

**`VITE_RETRY_DELAY`**
- **Description:** Delay between retries (milliseconds)
- **Default:** `1000` (1 second)

#### Cache Settings

**`VITE_CACHE_TTL`**
- **Description:** Cache time-to-live (milliseconds)
- **Default:** `300000` (5 minutes)

#### Session Settings

**`VITE_SESSION_TIMEOUT_WARNING`**
- **Description:** Show warning before session expires (milliseconds)
- **Default:** `300000` (5 minutes)

**`VITE_TOKEN_REFRESH_INTERVAL`**
- **Description:** Token refresh interval (milliseconds)
- **Default:** `840000` (14 minutes)

#### File Upload Settings

**`VITE_MAX_IMAGE_SIZE`**
- **Description:** Maximum image size (bytes)
- **Default:** `5242880` (5MB)

**`VITE_MAX_IMAGES_PER_INSPECTION`**
- **Description:** Maximum images per inspection
- **Default:** `10`

#### Pagination Settings

**`VITE_DEFAULT_PAGE_SIZE`**
- **Description:** Default page size for tables
- **Default:** `20`

**`VITE_MAX_PAGE_SIZE`**
- **Description:** Maximum page size
- **Default:** `100`

#### Auto-save Settings

**`VITE_AUTO_SAVE_INTERVAL`**
- **Description:** Auto-save interval (milliseconds)
- **Default:** `30000` (30 seconds)

**`VITE_AUTO_SAVE_EXPIRY`**
- **Description:** Auto-save data expiry (milliseconds)
- **Default:** `86400000` (24 hours)

#### Security Settings

**`VITE_ENABLE_HTTPS`**
- **Description:** Enable HTTPS in development
- **Options:** `true`, `false`
- **Default:** `false`

**`VITE_CORS_ORIGINS`**
- **Description:** CORS allowed origins (comma-separated)
- **Default:** `http://localhost:5173,http://localhost:3000`

---

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API

### Step 2: Create OAuth Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
6. Copy the **Client ID**

### Step 3: Update Environment Variables
```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

### Step 4: Update Backend
Also update the backend `.env`:
```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 🌍 Environment-Specific Configurations

### Development (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_REACT_DEVTOOLS=true
```

### Staging (.env.staging)
```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api/v1
VITE_APP_ENV=staging
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=true
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOURCE_MAPS=false
```

---

## 🚀 Deployment Configurations

### Vercel
1. Go to project settings
2. Navigate to **Environment Variables**
3. Add all required variables
4. Set different values for **Production**, **Preview**, **Development**

### Netlify
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add all required variables
3. Deploy

### Docker
Create `.env.docker`:
```env
VITE_API_BASE_URL=http://backend:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-client-id
```

---

## 🔍 Troubleshooting

### Issue: "Missing required environment variables"
**Solution:** Ensure `.env` file exists and contains `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`

### Issue: API requests failing
**Solution:** 
1. Check `VITE_API_BASE_URL` is correct
2. Ensure backend is running
3. Check CORS settings

### Issue: Google OAuth not working
**Solution:**
1. Verify `VITE_GOOGLE_CLIENT_ID` is correct
2. Check authorized origins in Google Cloud Console
3. Ensure backend has matching credentials

### Issue: Environment variables not updating
**Solution:**
1. Stop the dev server
2. Update `.env` file
3. Restart dev server: `npm run dev`
4. Clear browser cache if needed

---

## 📝 Best Practices

### Security
- ✅ Never commit `.env` to version control
- ✅ Use `.env.example` as template
- ✅ Use different credentials for each environment
- ✅ Rotate secrets regularly
- ✅ Use environment-specific values

### Organization
- ✅ Group related variables
- ✅ Add comments for clarity
- ✅ Use consistent naming (VITE_ prefix)
- ✅ Document all variables

### Development
- ✅ Use `.env.local` for local overrides
- ✅ Keep `.env.example` updated
- ✅ Validate required variables on startup
- ✅ Log configuration in development

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Environment Best Practices](https://12factor.net/config)

---

## ✅ Checklist

Before deploying, ensure:

- [ ] All required variables are set
- [ ] API URL points to correct backend
- [ ] Google OAuth credentials are configured
- [ ] Environment-specific values are correct
- [ ] Sensitive data is not in version control
- [ ] `.env.example` is up to date
- [ ] Backend environment variables match
- [ ] CORS origins are configured
- [ ] SSL certificates are valid (production)
- [ ] Analytics are configured (if enabled)

---

**Need Help?** Check the main README.md or COMPLETE.md for more information.
