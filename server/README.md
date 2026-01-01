# Ketu Kakahala Vehicle Rentals - Backend API

A RESTful API backend for the Ketu Rental Management System built with Node.js, Express, and SQLite.

## Features

- ✅ RESTful API endpoints for all operations
- ✅ SQLite database (no separate database server needed)
- ✅ CRUD operations for Vehicles, Customers, Bookings, Payments, Maintenance, and Documents
- ✅ Support for base64 file uploads (license documents, images)
- ✅ Data migration script for existing data
- ✅ CORS enabled for frontend integration

## Installation

### 1. Install Node.js
Make sure you have Node.js installed (version 14 or higher).
Download from: https://nodejs.org/

### 2. Install Dependencies
```bash
cd "/Users/emmz/Downloads/Rental App Backend"
npm install
```

### 3. Migrate Existing Data (Optional)
If you have existing data in the JSON backup file:
```bash
npm run migrate
```

This will import all data from `rental-app-backup-2025-12-16.json` into the database.

### 4. Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on: **http://localhost:3001**

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create new document
- `DELETE /api/documents/:id` - Delete document

### Company Info
- `GET /api/company` - Get company information
- `PUT /api/company` - Update company information

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - Check server status

## Database

The application uses SQLite with the following tables:

- **vehicles** - Vehicle inventory
- **customers** - Customer records with license documents
- **bookings** - Rental bookings with damage tracking
- **payments** - Payment records
- **maintenance** - Maintenance schedules
- **documents** - Additional documents
- **company_info** - Company settings and branding

Database file: `rental.db` (created automatically)

## Example API Usage

### Create a Vehicle
```bash
curl -X POST http://localhost:3001/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Corolla",
    "year": 2024,
    "licensePlate": "N 123-456 W",
    "dailyRate": 500,
    "color": "White",
    "mileage": 5000
  }'
```

### Get All Bookings
```bash
curl http://localhost:3001/api/bookings
```

## File Structure

```
Rental App Backend/
├── package.json          # Project dependencies
├── server.js            # Express server and API routes
├── database.js          # Database schema and initialization
├── migrate.js           # Data migration script
├── rental.db            # SQLite database (auto-generated)
└── README.md            # This file
```

## Next Steps

After starting the backend server, you'll need to update your frontend HTML file to connect to this API instead of using localStorage.

## Support

For issues or questions, refer to the main application documentation.
