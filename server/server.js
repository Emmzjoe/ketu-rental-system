const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, getDb, saveDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Helper to convert sql.js results to array of objects
function resultsToArray(results) {
    if (!results.length || !results[0].values.length) return [];
    const columns = results[0].columns;
    return results[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

// ==================== VEHICLES ====================

app.get('/api/vehicles', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM vehicles ORDER BY id DESC');
        res.json(resultsToArray(results));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vehicles/:id', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM vehicles WHERE id = ?', [parseInt(req.params.id)]);
        const vehicles = resultsToArray(results);
        if (!vehicles.length) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(vehicles[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vehicles', (req, res) => {
    try {
        const db = getDb();
        const { make, model, year, licensePlate, dailyRate, status, color, mileage } = req.body;
        db.run(`
            INSERT INTO vehicles (make, model, year, licensePlate, dailyRate, status, color, mileage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [make, model, year, licensePlate, dailyRate, status || 'available', color, mileage]);

        const results = db.exec('SELECT * FROM vehicles WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/vehicles/:id', (req, res) => {
    try {
        const db = getDb();
        const { make, model, year, licensePlate, dailyRate, status, color, mileage } = req.body;
        db.run(`
            UPDATE vehicles
            SET make = ?, model = ?, year = ?, licensePlate = ?, dailyRate = ?,
                status = ?, color = ?, mileage = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [make, model, year, licensePlate, dailyRate, status, color, mileage, parseInt(req.params.id)]);

        const results = db.exec('SELECT * FROM vehicles WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/vehicles/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM vehicles WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CUSTOMERS ====================

app.get('/api/customers', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM customers ORDER BY id DESC');
        const customers = resultsToArray(results);
        customers.forEach(customer => {
            if (customer.licenseDocument) {
                try {
                    customer.licenseDocument = JSON.parse(customer.licenseDocument);
                } catch (e) {
                    customer.licenseDocument = null;
                }
            }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/customers/:id', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM customers WHERE id = ?', [parseInt(req.params.id)]);
        const customers = resultsToArray(results);
        if (!customers.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const customer = customers[0];
        if (customer.licenseDocument) {
            try {
                customer.licenseDocument = JSON.parse(customer.licenseDocument);
            } catch (e) {
                customer.licenseDocument = null;
            }
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers', (req, res) => {
    try {
        const db = getDb();
        const { name, email, phone, address, license, licenseNumber, emergencyContact, licenseDocument, createdDate } = req.body;
        db.run(`
            INSERT INTO customers (name, email, phone, address, license, licenseNumber, emergencyContact, licenseDocument, createdDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, email, phone, address, license, licenseNumber, emergencyContact,
            licenseDocument ? JSON.stringify(licenseDocument) : null,
            createdDate || new Date().toISOString()
        ]);

        const results = db.exec('SELECT * FROM customers WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/customers/:id', (req, res) => {
    try {
        const db = getDb();
        const { name, email, phone, address, license, licenseNumber, emergencyContact, licenseDocument } = req.body;
        db.run(`
            UPDATE customers
            SET name = ?, email = ?, phone = ?, address = ?, license = ?, licenseNumber = ?,
                emergencyContact = ?, licenseDocument = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            name, email, phone, address, license, licenseNumber, emergencyContact,
            licenseDocument ? JSON.stringify(licenseDocument) : null,
            parseInt(req.params.id)
        ]);

        const results = db.exec('SELECT * FROM customers WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/customers/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM customers WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== BOOKINGS ====================

app.get('/api/bookings', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM bookings ORDER BY id DESC');
        const bookings = resultsToArray(results);
        bookings.forEach(booking => {
            if (booking.damages) {
                try {
                    booking.damages = JSON.parse(booking.damages);
                } catch (e) {
                    booking.damages = [];
                }
            }
            if (booking.licenseDocument) {
                try {
                    booking.licenseDocument = JSON.parse(booking.licenseDocument);
                } catch (e) {
                    booking.licenseDocument = null;
                }
            }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bookings', (req, res) => {
    try {
        const db = getDb();
        const {
            customerId, customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
            vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
            securityDeposit, totalAmount, damages, damageNotes, status, licenseDocument
        } = req.body;

        db.run(`
            INSERT INTO bookings (
                customerId, customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
                vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
                securityDeposit, totalAmount, damages, damageNotes, status, licenseDocument
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customerId || null, customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
            vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
            securityDeposit || 2500, totalAmount,
            damages ? JSON.stringify(damages) : '[]',
            damageNotes, status || 'active',
            licenseDocument ? JSON.stringify(licenseDocument) : null
        ]);

        const results = db.exec('SELECT * FROM bookings WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/bookings/:id', (req, res) => {
    try {
        const db = getDb();
        const {
            customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
            vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
            securityDeposit, totalAmount, damages, damageNotes, status, licenseDocument
        } = req.body;

        db.run(`
            UPDATE bookings SET
                customerName = ?, customerEmail = ?, customerPhone = ?, driverLicense = ?, emergencyContact = ?,
                vehicleId = ?, vehicleName = ?, licensePlate = ?, startDate = ?, endDate = ?,
                odometerReading = ?, fuelLevel = ?, securityDeposit = ?, totalAmount = ?,
                damages = ?, damageNotes = ?, status = ?, licenseDocument = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            customerName, customerEmail, customerPhone, driverLicense, emergencyContact,
            vehicleId, vehicleName, licensePlate, startDate, endDate, odometerReading, fuelLevel,
            securityDeposit, totalAmount,
            damages ? JSON.stringify(damages) : '[]',
            damageNotes, status,
            licenseDocument ? JSON.stringify(licenseDocument) : null,
            parseInt(req.params.id)
        ]);

        const results = db.exec('SELECT * FROM bookings WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/bookings/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM bookings WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PAYMENTS ====================

app.get('/api/payments', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM payments ORDER BY id DESC');
        res.json(resultsToArray(results));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments', (req, res) => {
    try {
        const db = getDb();
        const { bookingId, customerName, amount, paymentMethod, date, notes } = req.body;
        db.run(`
            INSERT INTO payments (bookingId, customerName, amount, paymentMethod, date, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [bookingId, customerName, amount, paymentMethod, date, notes]);

        const results = db.exec('SELECT * FROM payments WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/payments/:id', (req, res) => {
    try {
        const db = getDb();
        const { bookingId, customerName, amount, paymentMethod, date, notes } = req.body;
        db.run(`
            UPDATE payments
            SET bookingId = ?, customerName = ?, amount = ?, paymentMethod = ?, date = ?, notes = ?
            WHERE id = ?
        `, [bookingId, customerName, amount, paymentMethod, date, notes, parseInt(req.params.id)]);

        const results = db.exec('SELECT * FROM payments WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/payments/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM payments WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MAINTENANCE ====================

app.get('/api/maintenance', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM maintenance ORDER BY id DESC');
        res.json(resultsToArray(results));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/maintenance', (req, res) => {
    try {
        const db = getDb();
        const { vehicleId, vehicleName, type, description, date, status } = req.body;
        db.run(`
            INSERT INTO maintenance (vehicleId, vehicleName, type, description, date, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [vehicleId, vehicleName, type, description, date, status || 'pending']);

        const results = db.exec('SELECT * FROM maintenance WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/maintenance/:id', (req, res) => {
    try {
        const db = getDb();
        const { vehicleId, vehicleName, type, description, date, status } = req.body;
        db.run(`
            UPDATE maintenance
            SET vehicleId = ?, vehicleName = ?, type = ?, description = ?, date = ?, status = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [vehicleId, vehicleName, type, description, date, status, parseInt(req.params.id)]);

        const results = db.exec('SELECT * FROM maintenance WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/maintenance/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM maintenance WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DOCUMENTS ====================

app.get('/api/documents', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM documents ORDER BY id DESC');
        res.json(resultsToArray(results));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/documents', (req, res) => {
    try {
        const db = getDb();
        const { bookingId, customerName, vehicleName, type, notes, date, fileData, fileName } = req.body;
        db.run(`
            INSERT INTO documents (bookingId, customerName, vehicleName, type, notes, date, fileData, fileName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [bookingId, customerName, vehicleName, type, notes, date, fileData, fileName]);

        const results = db.exec('SELECT * FROM documents WHERE id = last_insert_rowid()');
        saveDatabase();
        res.status(201).json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/documents/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM documents WHERE id = ?', [parseInt(req.params.id)]);
        saveDatabase();
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== COMPANY INFO ====================

app.get('/api/company', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM company_info WHERE id = 1');
        const company = resultsToArray(results);
        res.json(company.length ? company[0] : {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/company', (req, res) => {
    try {
        const db = getDb();
        const { name, phone, email, address, website, logo } = req.body;
        db.run(`
            UPDATE company_info
            SET name = ?, phone = ?, email = ?, address = ?, website = ?, logo = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = 1
        `, [name, phone, email, address, website, logo]);

        const results = db.exec('SELECT * FROM company_info WHERE id = 1');
        saveDatabase();
        res.json(resultsToArray(results)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STATISTICS ====================

app.get('/api/stats', (req, res) => {
    try {
        const db = getDb();

        const vehicleResults = db.exec('SELECT COUNT(*) as count FROM vehicles');
        const totalVehicles = vehicleResults[0].values[0][0];

        const bookingResults = db.exec("SELECT COUNT(*) as count FROM bookings WHERE status = 'active'");
        const activeBookings = bookingResults[0].values[0][0];

        const customerResults = db.exec('SELECT COUNT(*) as count FROM customers');
        const totalCustomers = customerResults[0].values[0][0];

        const revenueResults = db.exec('SELECT SUM(amount) as total FROM payments');
        const totalRevenue = revenueResults[0].values[0][0] || 0;

        res.json({
            totalVehicles,
            activeBookings,
            totalCustomers,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚗 Ketu Rental API Server`);
        console.log(`📡 Server running on http://localhost:${PORT}`);
        console.log(`🗄️  Database: SQLite (rental.db)`);
        console.log(`\nAvailable endpoints:`);
        console.log(`  GET    /api/vehicles`);
        console.log(`  GET    /api/customers`);
        console.log(`  GET    /api/bookings`);
        console.log(`  GET    /api/payments`);
        console.log(`  GET    /api/maintenance`);
        console.log(`  GET    /api/documents`);
        console.log(`  GET    /api/company`);
        console.log(`  GET    /api/stats`);
        console.log(`\n✅ Ready to accept requests\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
