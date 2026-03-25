/**
 * Migration Script: Add zoneCode to Existing Data
 * 
 * This script migrates existing TrackFittings, Inspections, AIReports, and PerformanceLogs
 * to include the mandatory zoneCode field required for sharding.
 * 
 * IMPORTANT: Run this script BEFORE enabling sharding in production.
 * 
 * Usage:
 *   node scripts/migrateExistingData.js
 * 
 * Options:
 *   --dry-run    : Preview changes without applying them
 *   --zone=NR    : Assign all records to a specific zone (for testing)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TrackFitting = require('../src/modules/qr/model');
const Inspection = require('../src/modules/inspection/model');
const AIReport = require('../src/modules/ai/model');
const PerformanceLog = require('../src/modules/performance/model');
const { RAILWAY_ZONES } = require('../src/utils/shardingHelper');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceZone = args.find(arg => arg.startsWith('--zone='))?.split('=')[1];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function migrateTrackFittings() {
  console.log('\n📦 Migrating TrackFittings...');
  
  const fittingsWithoutZone = await TrackFitting.countDocuments({ zoneCode: { $exists: false } });
  console.log(`Found ${fittingsWithoutZone} fittings without zoneCode`);
  
  if (fittingsWithoutZone === 0) {
    console.log('✅ All fittings already have zoneCode');
    return;
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN: Would update', fittingsWithoutZone, 'fittings');
    return;
  }
  
  // Strategy 1: If forceZone is specified, use it
  if (forceZone) {
    if (!RAILWAY_ZONES[forceZone]) {
      console.error(`❌ Invalid zone code: ${forceZone}`);
      return;
    }
    
    const result = await TrackFitting.updateMany(
      { zoneCode: { $exists: false } },
      { 
        $set: { 
          zoneCode: forceZone,
          manufactureYear: { $year: '$manufacturingDate' }
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} fittings with zone ${forceZone}`);
    return;
  }
  
  // Strategy 2: Extract zone from location.zone field if available
  const fittingsWithLocation = await TrackFitting.find({
    zoneCode: { $exists: false },
    'location.zone': { $exists: true }
  }).limit(1000);
  
  if (fittingsWithLocation.length > 0) {
    console.log(`Found ${fittingsWithLocation.length} fittings with location.zone`);
    
    for (const fitting of fittingsWithLocation) {
      const locationZone = fitting.location?.zone?.toUpperCase();
      if (RAILWAY_ZONES[locationZone]) {
        await TrackFitting.updateOne(
          { _id: fitting._id },
          { 
            $set: { 
              zoneCode: locationZone,
              manufactureYear: new Date(fitting.manufacturingDate).getFullYear()
            } 
          }
        );
      }
    }
    
    console.log(`✅ Migrated ${fittingsWithLocation.length} fittings from location.zone`);
  }
  
  // Strategy 3: Distribute remaining fittings evenly across zones
  const remainingFittings = await TrackFitting.countDocuments({ zoneCode: { $exists: false } });
  
  if (remainingFittings > 0) {
    console.log(`⚠️  ${remainingFittings} fittings still need zoneCode`);
    console.log('💡 Recommendation: Manually assign zones based on depot/location data');
    console.log('   Or use --zone=XX flag to assign all to a specific zone');
  }
}

async function migrateInspections() {
  console.log('\n🔍 Migrating Inspections...');
  
  const inspectionsWithoutZone = await Inspection.countDocuments({ zoneCode: { $exists: false } });
  console.log(`Found ${inspectionsWithoutZone} inspections without zoneCode`);
  
  if (inspectionsWithoutZone === 0) {
    console.log('✅ All inspections already have zoneCode');
    return;
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN: Would update', inspectionsWithoutZone, 'inspections');
    return;
  }
  
  // Extract zoneCode from related fitting
  const inspections = await Inspection.find({ zoneCode: { $exists: false } })
    .populate('fitting', 'zoneCode')
    .limit(1000);
  
  let updated = 0;
  for (const inspection of inspections) {
    if (inspection.fitting?.zoneCode) {
      await Inspection.updateOne(
        { _id: inspection._id },
        { 
          $set: { 
            zoneCode: inspection.fitting.zoneCode,
            inspectionYear: new Date(inspection.inspectionDate).getFullYear()
          } 
        }
      );
      updated++;
    }
  }
  
  console.log(`✅ Updated ${updated} inspections with zoneCode from fittings`);
  
  const remaining = await Inspection.countDocuments({ zoneCode: { $exists: false } });
  if (remaining > 0) {
    console.log(`⚠️  ${remaining} inspections still need zoneCode (orphaned records?)`);
  }
}

async function migrateAIReports() {
  console.log('\n🤖 Migrating AI Reports...');
  
  const reportsWithoutZone = await AIReport.countDocuments({ zoneCode: { $exists: false } });
  console.log(`Found ${reportsWithoutZone} AI reports without zoneCode`);
  
  if (reportsWithoutZone === 0) {
    console.log('✅ All AI reports already have zoneCode');
    return;
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN: Would update', reportsWithoutZone, 'AI reports');
    return;
  }
  
  // Extract zoneCode from related fitting
  const reports = await AIReport.find({ zoneCode: { $exists: false } })
    .populate('fitting', 'zoneCode')
    .limit(1000);
  
  let updated = 0;
  for (const report of reports) {
    if (report.fitting?.zoneCode) {
      await AIReport.updateOne(
        { _id: report._id },
        { 
          $set: { 
            zoneCode: report.fitting.zoneCode,
            predictionYear: new Date(report.createdAt).getFullYear()
          } 
        }
      );
      updated++;
    }
  }
  
  console.log(`✅ Updated ${updated} AI reports with zoneCode from fittings`);
  
  const remaining = await AIReport.countDocuments({ zoneCode: { $exists: false } });
  if (remaining > 0) {
    console.log(`⚠️  ${remaining} AI reports still need zoneCode (orphaned records?)`);
  }
}

async function migratePerformanceLogs() {
  console.log('\n📊 Migrating Performance Logs...');
  
  const logsWithoutZone = await PerformanceLog.countDocuments({ zoneCode: { $exists: false } });
  console.log(`Found ${logsWithoutZone} performance logs without zoneCode`);
  
  if (logsWithoutZone === 0) {
    console.log('✅ All performance logs already have zoneCode');
    return;
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN: Would update', logsWithoutZone, 'performance logs');
    return;
  }
  
  // Extract zoneCode from related fitting
  const logs = await PerformanceLog.find({ zoneCode: { $exists: false } })
    .populate('fitting', 'zoneCode')
    .limit(1000);
  
  let updated = 0;
  for (const log of logs) {
    if (log.fitting?.zoneCode) {
      await PerformanceLog.updateOne(
        { _id: log._id },
        { 
          $set: { 
            zoneCode: log.fitting.zoneCode,
            logYear: new Date(log.recordedDate).getFullYear()
          } 
        }
      );
      updated++;
    }
  }
  
  console.log(`✅ Updated ${updated} performance logs with zoneCode from fittings`);
  
  const remaining = await PerformanceLog.countDocuments({ zoneCode: { $exists: false } });
  if (remaining > 0) {
    console.log(`⚠️  ${remaining} performance logs still need zoneCode (orphaned records?)`);
  }
}

async function generateMigrationReport() {
  console.log('\n📋 Migration Report:');
  console.log('═══════════════════════════════════════════════════════');
  
  const fittingsTotal = await TrackFitting.countDocuments();
  const fittingsWithZone = await TrackFitting.countDocuments({ zoneCode: { $exists: true } });
  const fittingsWithoutZone = fittingsTotal - fittingsWithZone;
  
  const inspectionsTotal = await Inspection.countDocuments();
  const inspectionsWithZone = await Inspection.countDocuments({ zoneCode: { $exists: true } });
  const inspectionsWithoutZone = inspectionsTotal - inspectionsWithZone;
  
  const reportsTotal = await AIReport.countDocuments();
  const reportsWithZone = await AIReport.countDocuments({ zoneCode: { $exists: true } });
  const reportsWithoutZone = reportsTotal - reportsWithZone;
  
  const logsTotal = await PerformanceLog.countDocuments();
  const logsWithZone = await PerformanceLog.countDocuments({ zoneCode: { $exists: true } });
  const logsWithoutZone = logsTotal - logsWithZone;
  
  console.log(`TrackFittings:     ${fittingsWithZone}/${fittingsTotal} (${fittingsWithoutZone} missing)`);
  console.log(`Inspections:       ${inspectionsWithZone}/${inspectionsTotal} (${inspectionsWithoutZone} missing)`);
  console.log(`AI Reports:        ${reportsWithZone}/${reportsTotal} (${reportsWithoutZone} missing)`);
  console.log(`Performance Logs:  ${logsWithZone}/${logsTotal} (${logsWithoutZone} missing)`);
  console.log('═══════════════════════════════════════════════════════');
  
  const totalMissing = fittingsWithoutZone + inspectionsWithoutZone + reportsWithoutZone + logsWithoutZone;
  
  if (totalMissing === 0) {
    console.log('✅ All records have zoneCode - Ready for sharding!');
  } else {
    console.log(`⚠️  ${totalMissing} records still need zoneCode`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Review records without zoneCode');
    console.log('   2. Assign zones based on depot/location data');
    console.log('   3. Or use --zone=XX to assign all to a specific zone');
    console.log('   4. Re-run this script to verify');
  }
}

async function main() {
  console.log('🚆 RailTrack AI - Data Migration Script');
  console.log('═══════════════════════════════════════════════════════');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  if (forceZone) {
    console.log(`🎯 Force Zone: ${forceZone}`);
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  await connectDB();
  
  await migrateTrackFittings();
  await migrateInspections();
  await migrateAIReports();
  await migratePerformanceLogs();
  
  await generateMigrationReport();
  
  await mongoose.disconnect();
  console.log('\n✅ Migration complete');
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
