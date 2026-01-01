# Ketu Kakahala Vehicle Rental Management System

A comprehensive vehicle rental management system with full database integration for Ketu Kakahala Vehicle Rentals.

## Features

### Vehicle Management
- Add, edit, delete, and duplicate vehicles
- Import/export vehicle data
- Vehicle availability tracking
- Complete vehicle information (make, model, year, registration, etc.)

### Customer Management
- Customer database with auto-fill functionality
- License document upload and storage
- Customer lookup and search
- Complete customer profiles (name, phone, email, address, license info)

### Booking System
- Create and manage rental bookings
- Customer lookup integration
- Interactive car damage diagram
- License document upload at booking
- PDF rental agreement generation
- Date range selection
- Real-time availability checking

### Payment Tracking
- Record payments linked to bookings
- Payment history
- Multiple payment methods
- Outstanding balance tracking

### Maintenance Scheduling
- Schedule vehicle maintenance
- Track maintenance status
- Maintenance history per vehicle
- Cost tracking

### Additional Features
- Dashboard with statistics and analytics
- Company logo upload
- PDF rental agreements with company branding
- Data export functionality
- Database-backed unlimited storage
- Real-time connection status indicator

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive design

### Backend
- Node.js
- Express.js
- SQLite database (sql.js)
- CORS enabled
- RESTful API

## Project Structure

```
Ketu-Rental-System/
├── client/           # Frontend application
│   ├── ketu-rental-database.html    # Main application (database version)
│   ├── ketu-rental (1).html         # Original version (localStorage)
│   └── *.md                         # Documentation files
├── server/           # Backend API
│   ├── server.js     # Express server
│   ├── database.js   # Database layer
│   ├── migrate.js    # Migration scripts
│   ├── rental.db     # SQLite database
│   └── package.json  # Backend dependencies
└── README.md         # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Emmzjoe/ketu-rental-system.git
cd ketu-rental-system
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Start the backend server:
```bash
npm start
```

You should see:
```
🚗 Ketu Rental API Server
📡 Server running on http://localhost:3001
✅ Ready to accept requests
```

4. Open the frontend:
- Navigate to the `client` folder
- Open `ketu-rental-database.html` in your web browser
- Check the connection status indicator (top-right corner)
  - 🟢 Green = Connected to database
  - 🔴 Red = Disconnected (using localStorage fallback)

## Usage

### Starting the Application

1. Start backend server:
```bash
cd server
npm start
```

2. Open `client/ketu-rental-database.html` in your browser

3. Verify connection status shows green "Database Connected"

### Connection Status

- **🟢 Connected (Green)**: All data saved to database, no limits
- **🟡 Loading (Yellow)**: Connecting to database, please wait
- **🔴 Disconnected (Red)**: Using localStorage fallback, check backend

### Data Backup

The database file is located at `server/rental.db`. To backup:

```bash
cd server
cp rental.db "rental-backup-$(date +%Y-%m-%d).db"
```

### Data Migration

If you have data in the old localStorage version:

1. Open the old version (`ketu-rental (1).html`)
2. Go to Settings → Export All Data
3. Save the JSON file
4. Import using the migration script or contact support

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

## Development

### Running in Development Mode

```bash
cd server
npm run dev
```

This uses nodemon for auto-restart on file changes.

### Database Schema

The SQLite database includes tables for:
- Vehicles
- Customers
- Bookings
- Payments
- Maintenance
- Settings

### Adding New Features

1. Update database schema in `database.js`
2. Add API endpoints in `server.js`
3. Update frontend HTML/JavaScript
4. Test thoroughly
5. Commit changes

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (should be v14+)

### Connection status shows red
- Verify backend is running (`npm start`)
- Check backend URL is `http://localhost:3001`
- Check browser console (F12) for error messages
- Ensure CORS is enabled in backend

### Data not loading
- Check connection status (top-right)
- Open browser console (F12) for errors
- Verify backend terminal shows no errors
- Try refreshing the page

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built for Ketu Kakahala Vehicle Rentals** | Professional Rental Management System
