# QR Code Testing Instructions

## ✅ Setup Complete

All test QR codes have been generated and are ready to use!

## 📱 How to Test

### Option 1: View QR Codes in Browser
1. Make sure your frontend dev server is running (`npm run dev`)
2. Open: `http://localhost:5173/test-qr-codes.html`
3. You'll see 6 test QR codes for different railway assets

### Option 2: Test Scanning
1. Login to the app as Inspector (test@railtrack.com / Test@123)
2. Navigate to "Scan QR" from the bottom navigation or Quick Actions
3. Click "Start Camera" to activate your device camera
4. Point your camera at any QR code from the test page
5. The scanner will automatically detect and read the code
6. You'll see the asset information and can start an inspection

### 💡 Testing Tips

- **Desktop Testing**: Open the test QR codes page on your desktop browser, then use your phone to scan them
- **Mobile Testing**: Open the test QR codes page on a second device or print them out
- **Manual Entry**: If camera doesn't work, use the "Manual" button to type in a code like: `COACH-A-1234|Coach|Platform 3, Depot A|ICF Chennai`

## 📦 Available Test Assets

1. **COACH-A-1234** - Coach at Platform 3, Depot A (ICF Chennai)
2. **ENGINE-E-5678** - Engine at Maintenance Bay 2 (CLW Chittaranjan)
3. **WHEEL-W-9012** - Wheel Set at Workshop Section B (RWF Bangalore)
4. **BOGIE-B-3456** - Bogie Assembly at Assembly Line 1 (RCF Kapurthala)
5. **COACH-C-7890** - Coach at Platform 7, Depot C (MCF Raebareli)
6. **ENGINE-D-2468** - Diesel Engine at Shed 4, Depot B (DLW Varanasi)

## 🔧 QR Code Format

Each QR code contains data in this format:
```
ASSET_ID|ASSET_TYPE|LOCATION|MANUFACTURER
```

Example: `COACH-A-1234|Coach|Platform 3, Depot A|ICF Chennai`

## 📁 File Locations

- QR Code Images: `Railway Scan - Frontend/public/qr-codes/*.png`
- Test Page: `Railway Scan - Frontend/public/test-qr-codes.html`
- Generator Script: `Railway Scan - Backend/railway/backend/scripts/generateTestQRCodes.js`

## 🔄 Regenerating QR Codes

If you need to regenerate the QR codes:
```bash
cd "Railway Scan - Backend/railway/backend"
node scripts/generateTestQRCodes.js
```
