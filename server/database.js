const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'rental.db');

let db;

// Initialize database
async function initializeDatabase() {
    const SQL = await initSqlJs();

    // Try to load existing database, or create new one
    let buffer;
    if (fs.existsSync(dbPath)) {
        buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('Created new database');
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            licensePlate TEXT UNIQUE NOT NULL,
            dailyRate REAL NOT NULL,
            status TEXT DEFAULT 'available',
            color TEXT,
            mileage INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            license TEXT,
            licenseNumber TEXT,
            emergencyContact TEXT,
            licenseDocument TEXT,
            createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerId INTEGER,
            customerName TEXT NOT NULL,
            customerEmail TEXT,
            customerPhone TEXT,
            driverLicense TEXT,
            emergencyContact TEXT,
            vehicleId INTEGER NOT NULL,
            vehicleName TEXT,
            licensePlate TEXT,
            startDate DATE NOT NULL,
            endDate DATE NOT NULL,
            odometerReading INTEGER,
            fuelLevel TEXT DEFAULT 'Full',
            securityDeposit REAL DEFAULT 2500,
            totalAmount REAL NOT NULL,
            damages TEXT,
            damageNotes TEXT,
            status TEXT DEFAULT 'active',
            licenseDocument TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookingId INTEGER NOT NULL,
            customerName TEXT NOT NULL,
            amount REAL NOT NULL,
            paymentMethod TEXT NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS maintenance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicleId INTEGER NOT NULL,
            vehicleName TEXT,
            type TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            status TEXT DEFAULT 'pending',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookingId INTEGER NOT NULL,
            customerName TEXT,
            vehicleName TEXT,
            type TEXT NOT NULL,
            notes TEXT,
            date DATE NOT NULL,
            fileData TEXT,
            fileName TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS company_info (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT DEFAULT 'Ketu Kakahala Vehicle Rentals',
            phone TEXT,
            email TEXT,
            address TEXT,
            website TEXT,
            logo TEXT,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert default company info if not exists
    const result = db.exec('SELECT COUNT(*) as count FROM company_info');
    if (!result.length || result[0].values[0][0] === 0) {
        db.run(`
            INSERT INTO company_info (id, name, phone, email, address, website)
            VALUES (1, 'Ketu Kakahala Vehicle Rentals', '', '', '', '')
        `);
    }

    saveDatabase();
    console.log('Database initialized successfully');
    return db;
}

// Save database to file
function saveDatabase() {
    if (db) {
        const data = db.export();
        fs.writeFileSync(dbPath, data);
    }
}

// Export functions
module.exports = {
    initializeDatabase,
    getDb: () => db,
    saveDatabase
};
