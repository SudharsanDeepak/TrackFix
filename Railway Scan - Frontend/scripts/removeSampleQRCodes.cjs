const fs = require('fs')
const path = require('path')

const qrDir = path.join(__dirname, '..', 'public', 'qr-codes')

if (!fs.existsSync(qrDir)) {
  console.log('QR codes directory not found:', qrDir)
  process.exit(0)
}

const files = fs.readdirSync(qrDir)
if (!files.length) {
  console.log('No files to remove in', qrDir)
  process.exit(0)
}

files.forEach((f) => {
  const p = path.join(qrDir, f)
  try {
    fs.unlinkSync(p)
    console.log('Deleted', p)
  } catch (err) {
    console.error('Failed to delete', p, err.message)
  }
})

console.log('Sample QR code cleanup complete')
