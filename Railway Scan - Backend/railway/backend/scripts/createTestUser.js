const mongoose = require('mongoose');
const User = require('../src/modules/auth/model');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@railtrack.com' });
    
    if (existingUser) {
      console.log('Test user already exists:');
      console.log('Email: test@railtrack.com');
      console.log('Role:', existingUser.role);
      console.log('\nYou can login with:');
      console.log('Email: test@railtrack.com');
      console.log('Password: Test@123');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const testUser = await User.create({
      name: 'Test Inspector',
      email: 'test@railtrack.com',
      password: 'Test@123',
      role: 'INSPECTOR',
      depotId: 'DEPOT001',
      authProvider: 'local',
      isActive: true,
    });

    console.log('✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: test@railtrack.com');
    console.log('Password: Test@123');
    console.log('Role:', testUser.role);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
