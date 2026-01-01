# Quick Start Guide - Ketu Rental Database Setup

## Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Verify installation by opening Terminal and running:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Dependencies

1. Open Terminal
2. Navigate to the backend folder:
   ```bash
   cd "/Users/emmz/Downloads/Rental App Backend"
   ```
3. Install required packages:
   ```bash
   npm install
   ```

This will install:
- express (web server)
- better-sqlite3 (database)
- cors (allow frontend to connect)
- body-parser (handle data)

## Step 3: Import Your Existing Data

1. Make sure your backup file `rental-app-backup-2025-12-16.json` is in the Downloads folder
2. Run the migration script:
   ```bash
   npm run migrate
   ```

You should see a summary of imported data:
- Vehicles
- Customers (with license numbers and documents)
- Bookings
- Payments
- Maintenance records
- Documents
- Company information

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚗 Ketu Rental API Server
📡 Server running on http://localhost:3001
🗄️  Database: SQLite (rental.db)

Available endpoints:
  GET    /api/vehicles
  GET    /api/customers
  ... etc

✅ Ready to accept requests
```

## Step 5: Test the API

Open a new Terminal window and test:

```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

Test getting vehicles:
```bash
curl http://localhost:3001/api/vehicles
```

## What Got Fixed

✅ Customer fields now work correctly:
- `license` field (from bookings) and `licenseNumber` (from customer form) both work
- Auto-fill pulls license number when selecting existing customer
- Search by license number works in booking form
- License documents are saved and retrieved correctly

✅ All customer details populate when making a booking:
- Name
- Email
- Phone
- License Number
- Emergency Contact
- License Document (if uploaded)

## Database Location

Your database is stored in:
`/Users/emmz/Downloads/Rental App Backend/rental.db`

This is a SQLite database file that contains all your data.

## Backup Your Database

To backup your database, simply copy the `rental.db` file:
```bash
cp rental.db "rental-backup-$(date +%Y-%m-%d).db"
```

## Troubleshooting

### Port already in use
If you see "Port 3001 already in use", either:
1. Stop the other process using that port
2. Change the port in server.js (line 7)

### Migration errors
If migration fails:
1. Delete `rental.db` file
2. Run migration again: `npm run migrate`

### Cannot find module
If you see module errors:
1. Delete `node_modules` folder
2. Run `npm install` again

## Next Steps

To connect your HTML frontend to this database:
1. Update your HTML file to use the API instead of localStorage
2. Use the `api-helper.js` file as a reference
3. Replace localStorage calls with API calls

Example:
```javascript
// Old way (localStorage)
const vehicles = storage.load('vehicles');

// New way (API)
const vehicles = await fetch('http://localhost:3001/api/vehicles').then(r => r.json());
```
