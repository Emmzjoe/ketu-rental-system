# Quick Start Guide - Database Version

## What's Being Created

A new file `ketu-rental-database.html` that:
- ✅ Works exactly like your current app
- ✅ Stores all data in the database (no localStorage limits!)
- ✅ Shows connection status
- ✅ All features preserved (license upload, damage diagrams, PDF export, etc.)
- ✅ Automatic fallback to localStorage if database is unavailable

## How to Use

### Step 1: Make Sure Database is Running
```bash
cd "/Users/emmz/Downloads/Rental App Backend"
npm start
```

You should see:
```
🚗 Ketu Rental API Server
📡 Server running on http://localhost:3001
✅ Ready to accept requests
```

### Step 2: Open the New App
Open `ketu-rental-database.html` in your browser

### Step 3: Check Connection
Look for the green indicator in the top-right corner:
- ✅ **Green "Connected"** = Database is working
- ⚠️ **Orange "Connecting"** = Trying to connect
- ❌ **Red "Disconnected"** = Using localStorage fallback

## Key Differences from Old Version

### Old Version (ketu-rental (1).html)
- ❌ Stores everything in browser localStorage
- ❌ 5-10MB limit
- ❌ License documents cause "quota exceeded" error
- ❌ Data only in your browser

### New Version (ketu-rental-database.html)
- ✅ Stores everything in SQLite database
- ✅ No size limits
- ✅ Unlimited license documents
- ✅ Data accessible from any browser
- ✅ Easy backups
- ✅ Multi-user ready

## Features Preserved

ALL your features work the same:

### Dashboard
- Total revenue display
- Active bookings count
- Vehicle statistics
- Rental days calculation

### Vehicles
- Add/Edit/Delete vehicles
- Import vehicles from JSON
- Export vehicles to JSON
- Duplicate vehicle
- Vehicle status management

### Bookings
- Customer auto-fill (smart lookup)
- License number auto-complete
- License document upload
- Interactive car damage diagram
- Odometer reading
- Fuel level selection
- Security deposit
- PDF rental agreement export
- Emergency contact

### Customers
- Customer management
- License document upload
- License document download
- Auto-created from bookings

### Payments
- Payment recording
- Payment methods (Cash, Card, Bank Transfer)
- Linked to bookings

### Maintenance
- Schedule maintenance
- Track maintenance status

### Settings
- Company logo upload
- Company information
- Logo appears on PDFs
- Data export/import
- Data statistics

## Troubleshooting

### "Disconnected" Status
**Problem:** Red indicator shows "Disconnected"

**Solution:**
1. Open Terminal
2. Run: `cd "/Users/emmz/Downloads/Rental App Backend"`
3. Run: `npm start`
4. Refresh the browser

### "CORS Error" in Console
**Problem:** Browser blocks API requests

**Solution:** The backend already has CORS enabled, but if you see this:
1. Make sure backend is running
2. Check the URL is exactly `http://localhost:3001`
3. Try a different browser (Chrome/Firefox/Safari)

### Data Not Showing
**Problem:** App loads but no data appears

**Solution:**
1. Check connection status (top right)
2. Open browser console (F12) for errors
3. Verify backend is running
4. Run migration again if needed: `npm run migrate`

### Old Data Missing
**Problem:** Your data from the old app is gone

**Solution:**
Your data is in the database! It was migrated from the JSON backup.
If you added new data in the old app after migration, export it:
1. Open old app (ketu-rental (1).html)
2. Go to Settings
3. Click "Export All Data"
4. Save the JSON file
5. Contact me to help import it

## Data Management

### Backup Your Database
```bash
cd "/Users/emmz/Downloads/Rental App Backend"
cp rental.db "rental-backup-$(date +%Y-%m-%d).db"
```

### Export Current Data
In the app:
1. Go to Settings
2. Click "Export All Data"
3. Save the JSON file

### Clear Everything (Start Fresh)
**⚠️ WARNING: This deletes all data!**
```bash
cd "/Users/emmz/Downloads/Rental App Backend"
rm rental.db
npm run migrate
```

## Performance

### Database Version is Faster! 🚀
- ⚡ No localStorage parsing delays
- ⚡ Efficient SQL queries
- ⚡ Better with large datasets
- ⚡ No browser memory issues

### File Sizes
- **Old version:** Limited by browser (5-10MB)
- **New version:** Database file grows as needed (100MB+ is fine)
- **License documents:** No limits! Store as many as you need

## Next Steps

Once the database version is ready:
1. ✅ Test it thoroughly
2. ✅ Make sure all features work
3. ✅ Keep the old version as backup
4. ✅ Use the new version for daily operations
5. ✅ Set up regular database backups

## Support

If something doesn't work:
1. Check the connection status
2. Look at browser console (F12)
3. Check backend terminal for errors
4. Let me know what's wrong and I'll fix it!
