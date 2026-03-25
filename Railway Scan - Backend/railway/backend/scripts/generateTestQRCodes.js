const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Create directory for QR codes if it doesn't exist
// Navigate from backend/scripts to project root, then to frontend public folder
const qrDir = path.join(__dirname, '../../..', '..', 'Railway Scan - Frontend', 'public', 'qr-codes');
console.log('Target directory:', qrDir);
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
  console.log('Created directory:', qrDir);
}

const assets = [
  {
    id: 'COACH-A-1234',
    type: 'Coach',
    location: 'Platform 3, Depot A',
    manufacturer: 'ICF Chennai',
  },
  {
    id: 'ENGINE-E-5678',
    type: 'Engine',
    location: 'Maintenance Bay 2',
    manufacturer: 'CLW Chittaranjan',
  },
  {
    id: 'WHEEL-W-9012',
    type: 'Wheel Set',
    location: 'Workshop Section B',
    manufacturer: 'RWF Bangalore',
  },
  {
    id: 'BOGIE-B-3456',
    type: 'Bogie Assembly',
    location: 'Assembly Line 1',
    manufacturer: 'RCF Kapurthala',
  },
  {
    id: 'COACH-C-7890',
    type: 'Coach',
    location: 'Platform 7, Depot C',
    manufacturer: 'MCF Raebareli',
  },
  {
    id: 'ENGINE-D-2468',
    type: 'Diesel Engine',
    location: 'Shed 4, Depot B',
    manufacturer: 'DLW Varanasi',
  },
];

async function generateQRCodes() {
  console.log('🔄 Generating QR codes...\n');

  for (const asset of assets) {
    // Format: ASSET_ID|ASSET_TYPE|LOCATION|MANUFACTURER
    const qrData = `${asset.id}|${asset.type}|${asset.location}|${asset.manufacturer}`;
    const filename = `${asset.id}.png`;
    const filepath = path.join(qrDir, filename);

    try {
      await QRCode.toFile(filepath, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      console.log(`✅ Generated: ${filename}`);
      console.log(`   Data: ${qrData}\n`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error);
    }
  }

  console.log(`\n✨ All QR codes generated successfully!`);
  console.log(`📁 Location: ${qrDir}`);
  console.log(`\n🌐 Access them at: http://localhost:5173/qr-codes/[ASSET-ID].png`);
}

generateQRCodes();
