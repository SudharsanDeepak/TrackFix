/**
 * Script to create test users for each role
 * Run with: node scripts/createTestUsers.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['INSPECTOR', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'ADMIN'],
    required: true,
  },
  phone: String,
  profileImage: String,
  depotId: String,
  zoneId: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)

const testUsers = [
  {
    name: 'Test Inspector',
    email: 'inspector@test.com',
    password: 'Test123!',
    role: 'INSPECTOR',
    phone: '+1234567890',
    depotId: 'depot-001',
  },
  {
    name: 'Test Depot Officer',
    email: 'depot@test.com',
    password: 'Test123!',
    role: 'DEPOT_OFFICER',
    phone: '+1234567891',
    depotId: 'depot-001',
  },
  {
    name: 'Test Zonal Manager',
    email: 'zonal@test.com',
    password: 'Test123!',
    role: 'ZONAL_MANAGER',
    phone: '+1234567892',
    zoneId: 'zone-001',
  },
  {
    name: 'Test Administrator',
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'ADMIN',
    phone: '+1234567893',
  },
]

async function createTestUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ Connected to MongoDB')

    // Delete existing test users
    console.log('\nDeleting existing test users...')
    const deleteResult = await User.deleteMany({
      email: { $in: testUsers.map(u => u.email) },
    })
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing test users`)

    // Create new test users
    console.log('\nCreating test users...')
    for (const userData of testUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      })

      console.log(`✓ Created ${user.role}: ${user.email}`)
    }

    console.log('\n✅ Test users created successfully!')
    console.log('\nTest User Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    testUsers.forEach(user => {
      console.log(`${user.role.padEnd(20)} | ${user.email.padEnd(25)} | ${user.password}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating test users:', error.message)
    process.exit(1)
  }
}

createTestUsers()
