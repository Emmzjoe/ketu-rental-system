const fs = require('fs');
const path = require('path');
const { initializeDatabase, getDb, saveDatabase } = require('./database');

console.log('🔄 Starting data migration...\n');

// Read the backup JSON file
const backupPath = path.join(__dirname, '..', 'rental-app-backup-2025-12-16.json');

if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found at:', backupPath);
    console.log('Please ensure rental-app-backup-2025-12-16.json is in the Downloads folder');
    process.exit(1);
}

console.log('📂 Reading backup file...');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Initialize database first
initializeDatabase().then(() => {
    const db = getDb();

    // Migrate Vehicles
    console.log('\n📦 Migrating vehicles...');
    if (backupData.vehicles && Array.isArray(backupData.vehicles)) {
        let count = 0;
        for (const vehicle of backupData.vehicles) {
            try {
                db.run(`
                    INSERT INTO vehicles (id, make, model, year, licensePlate, dailyRate, status, color, mileage)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    vehicle.id,
                    vehicle.make,
                    vehicle.model,
                    vehicle.year,
                    vehicle.licensePlate,
                    vehicle.dailyRate,
                    vehicle.status || 'available',
                    vehicle.color,
                    vehicle.mileage
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Skipping duplicate vehicle: ${vehicle.licensePlate}`);
            }
        }
        console.log(`✅ Migrated ${count} vehicles`);
    }

    // Migrate Customers
    console.log('\n👥 Migrating customers...');
    if (backupData.customers && Array.isArray(backupData.customers)) {
        let count = 0;
        for (const customer of backupData.customers) {
            try {
                db.run(`
                    INSERT INTO customers (id, name, email, phone, address, license, licenseNumber, emergencyContact, licenseDocument, createdDate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    customer.id,
                    customer.name,
                    customer.email || '',
                    customer.phone || '',
                    customer.address || '',
                    customer.license || '',
                    customer.licenseNumber || '',
                    customer.emergencyContact || '',
                    customer.licenseDocument ? JSON.stringify(customer.licenseDocument) : null,
                    customer.createdDate || new Date().toISOString()
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Skipping duplicate customer: ${customer.name}`);
            }
        }
        console.log(`✅ Migrated ${count} customers`);
    }

    // Migrate Bookings
    console.log('\n📅 Migrating bookings...');
    if (backupData.bookings && Array.isArray(backupData.bookings)) {
        let count = 0;
        for (const booking of backupData.bookings) {
            try {
                db.run(`
                    INSERT INTO bookings (
                        id, customerId, customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
                        vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
                        securityDeposit, totalAmount, damages, damageNotes, status, licenseDocument
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    booking.id,
                    booking.customerId || null,
                    booking.customerName,
                    booking.customerEmail || '',
                    booking.customerPhone || '',
                    booking.driverLicense || '',
                    booking.emergencyContact || '',
                    booking.vehicleId,
                    booking.vehicleName || '',
                    booking.licensePlate || '',
                    booking.startDate,
                    booking.endDate,
                    booking.odometerReading || 0,
                    booking.fuelLevel || 'Full',
                    booking.securityDeposit || 2500,
                    booking.totalAmount,
                    booking.damages ? JSON.stringify(booking.damages) : '[]',
                    booking.damageNotes || '',
                    booking.status || 'active',
                    booking.licenseDocument ? JSON.stringify(booking.licenseDocument) : null
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Error migrating booking ${booking.id}:`, error.message);
            }
        }
        console.log(`✅ Migrated ${count} bookings`);
    }

    // Migrate Payments
    console.log('\n💰 Migrating payments...');
    if (backupData.payments && Array.isArray(backupData.payments)) {
        let count = 0;
        for (const payment of backupData.payments) {
            try {
                db.run(`
                    INSERT INTO payments (id, bookingId, customerName, amount, paymentMethod, date, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    payment.id,
                    payment.bookingId,
                    payment.customerName,
                    payment.amount,
                    payment.paymentMethod || payment.method || '',
                    payment.date,
                    payment.notes || payment.status || ''
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Error migrating payment ${payment.id}:`, error.message);
            }
        }
        console.log(`✅ Migrated ${count} payments`);
    }

    // Migrate Maintenance
    console.log('\n🔧 Migrating maintenance records...');
    if (backupData.maintenance && Array.isArray(backupData.maintenance)) {
        let count = 0;
        for (const record of backupData.maintenance) {
            try {
                db.run(`
                    INSERT INTO maintenance (id, vehicleId, vehicleName, type, description, date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    record.id,
                    record.vehicleId,
                    record.vehicleName || '',
                    record.type || 'service',
                    record.description || '',
                    record.date,
                    record.status || 'pending'
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Error migrating maintenance ${record.id}:`, error.message);
            }
        }
        console.log(`✅ Migrated ${count} maintenance records`);
    }

    // Migrate Documents
    console.log('\n📄 Migrating documents...');
    if (backupData.documents && Array.isArray(backupData.documents)) {
        let count = 0;
        for (const doc of backupData.documents) {
            try {
                db.run(`
                    INSERT INTO documents (id, bookingId, customerName, vehicleName, type, notes, date, fileData, fileName)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    doc.id,
                    doc.bookingId || 0,
                    doc.customerName || '',
                    doc.vehicleName || '',
                    doc.type || 'document',
                    doc.notes || '',
                    doc.date || new Date().toISOString().split('T')[0],
                    doc.data || doc.fileData || null,
                    doc.name || doc.fileName || 'document'
                ]);
                count++;
            } catch (error) {
                console.log(`⚠️  Error migrating document ${doc.id}:`, error.message);
            }
        }
        console.log(`✅ Migrated ${count} documents`);
    }

    // Migrate Company Info
    console.log('\n🏢 Migrating company information...');
    if (backupData.companyInfo) {
        try {
            db.run(`
                UPDATE company_info
                SET name = ?, phone = ?, email = ?, address = ?, website = ?, logo = ?
                WHERE id = 1
            `, [
                backupData.companyInfo.name || 'Ketu Kakahala Vehicle Rentals',
                backupData.companyInfo.phone || '',
                backupData.companyInfo.email || '',
                backupData.companyInfo.address || '',
                backupData.companyInfo.website || '',
                backupData.companyInfo.logo || ''
            ]);
            console.log('✅ Company information updated');
        } catch (error) {
            console.log('⚠️  Error migrating company info:', error.message);
        }
    }

    // Save database to disk
    saveDatabase();

    // Display summary
    console.log('\n📊 Migration Summary:');
    console.log('═══════════════════════════════════════');

    const vehicleResults = db.exec('SELECT COUNT(*) as count FROM vehicles');
    const vehicleCount = vehicleResults[0].values[0][0];

    const customerResults = db.exec('SELECT COUNT(*) as count FROM customers');
    const customerCount = customerResults[0].values[0][0];

    const bookingResults = db.exec('SELECT COUNT(*) as count FROM bookings');
    const bookingCount = bookingResults[0].values[0][0];

    const paymentResults = db.exec('SELECT COUNT(*) as count FROM payments');
    const paymentCount = paymentResults[0].values[0][0];

    const maintenanceResults = db.exec('SELECT COUNT(*) as count FROM maintenance');
    const maintenanceCount = maintenanceResults[0].values[0][0];

    const documentResults = db.exec('SELECT COUNT(*) as count FROM documents');
    const documentCount = documentResults[0].values[0][0];

    console.log(`🚗 Vehicles:      ${vehicleCount}`);
    console.log(`👥 Customers:     ${customerCount}`);
    console.log(`📅 Bookings:      ${bookingCount}`);
    console.log(`💰 Payments:      ${paymentCount}`);
    console.log(`🔧 Maintenance:   ${maintenanceCount}`);
    console.log(`📄 Documents:     ${documentCount}`);
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Migration completed successfully!\n');

    process.exit(0);
}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
