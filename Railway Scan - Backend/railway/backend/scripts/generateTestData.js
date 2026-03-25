#!/usr/bin/env node

/**
 * Test Data Generator for Sharding Simulation
 * 
 * Generates realistic test data across multiple zones
 * to simulate national-scale deployment
 * 
 * Usage:
 * node scripts/generateTestData.js --count 10000
 */

const mongoose = require('mongoose');
require('dotenv').config();

const ZONES = ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro'];
const ITEM_TYPES = ['ERC', 'PANDROL', 'SLEEPER', 'FASTENER', 'BOLT', 'PLATE'];
const STATUSES = ['MANUFACTURED', 'IN_TRANSIT', 'INSTALLED', 'OPERATIONAL', 'DEFECTIVE'];

const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count='));
const COUNT = countArg ? parseInt(countArg.split('=')[1]) : 10000;

async function generateTestData() {
  try {
    console.log(`Generating ${COUNT} test fittings across ${ZONES.length} zones...`);
    
    await mongoose.connect(process.env.MONGO_URI);
    const TrackFitting = mongoose.model('TrackFitting', require('../src/modules/qr/model').schema);
    
    const fittings = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < COUNT; i++) {
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      const year = currentYear - Math.floor(Math.random() * 3);
      const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      const lotNumber = `LOT${year}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const serialNumber = String(i).padStart(6, '0');
      const uniqueQRId = `IR-${itemType}-${year}-${lotNumber}-${serialNumber}`;
      
      const manufacturingDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const warrantyPeriod = 24 + Math.floor(Math.random() * 24);
      const warrantyExpiry = new Date(manufacturingDate);
      warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyPeriod);
      
      fittings.push({
        uniqueQRId,
        zoneCode: zone,
        manufactureYear: year,
        itemType,
        lotNumber,
        serialNumber,
        vendor: new mongoose.Types.ObjectId(),
        vendorCode: `VEN${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
        manufacturingDate,
        warrantyPeriod,
        warrantyExpiry,
        specifications: {
          material: 'High Carbon Steel',
          grade: `Grade ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
        },
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        location: {
          depot: `${zone}-Depot-${Math.floor(Math.random() * 10) + 1}`,
          zone,
          division: `${zone}-DIV-${Math.floor(Math.random() * 5) + 1}`,
        },
        riskScore: Math.floor(Math.random() * 100),
        defectCount: Math.floor(Math.random() * 5),
        inspectionCount: Math.floor(Math.random() * 10),
      });
      
      if ((i + 1) % 1000 === 0) {
        console.log(`Generated ${i + 1}/${COUNT} records...`);
      }
    }
    
    console.log('\nInserting data into database...');
    await TrackFitting.insertMany(fittings, { ordered: false });
    
    console.log('\n✓ Test data generation complete!');
    console.log(`\nGenerated ${COUNT} fittings across zones:`);
    
    const zoneCounts = {};
    fittings.forEach(f => {
      zoneCounts[f.zoneCode] = (zoneCounts[f.zoneCode] || 0) + 1;
    });
    
    Object.entries(zoneCounts).forEach(([zone, count]) => {
      console.log(`  ${zone}: ${count} fittings`);
    });
    
  } catch (error) {
    console.error('Error generating test data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  generateTestData();
}

module.exports = generateTestData;
