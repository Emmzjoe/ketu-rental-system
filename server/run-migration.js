const fs = require('fs');
const path = require('path');
const { initializeDatabase, getDb, saveDatabase } = require('./database');

async function runMigration() {
    console.log('🔄 Starting subscription system migration...\n');

    try {
        // Initialize database
        await initializeDatabase();
        const db = getDb();

        // Read migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', 'add-subscription-system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log(`📝 Executing SQL migration file...\n`);

        // Execute the entire SQL file at once using db.exec()
        // This handles multi-line statements and inline comments correctly
        try {
            db.exec(migrationSQL);
            console.log('✅ All SQL statements executed successfully\n');
        } catch (error) {
            console.error('❌ Error executing migration SQL:', error.message);
            throw error;
        }

        // Count what was created by analyzing the SQL file
        const statements = migrationSQL.split(';').filter(s => s.trim().length > 0);
        const tableCount = statements.filter(s => s.includes('CREATE TABLE')).length;
        const insertCount = statements.filter(s => s.includes('INSERT INTO')).length;
        const indexCount = statements.filter(s => s.includes('CREATE INDEX')).length;

        // Save database
        saveDatabase();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration completed successfully!');
        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   • Tables created: ${tableCount}`);
        console.log(`   • Default data rows: ${insertCount}`);
        console.log(`   • Indexes created: ${indexCount}`);

        // Verify tables were created
        console.log('\n🔍 Verifying tables...');
        const tables = db.exec(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name LIKE '%subscription%' OR name LIKE '%invoice%' OR name LIKE '%receipt%'
            ORDER BY name
        `);

        if (tables.length > 0 && tables[0].values.length > 0) {
            console.log('\n✅ New tables created:');
            tables[0].values.forEach(([tableName]) => {
                console.log(`   • ${tableName}`);
            });
        }

        // Show subscription plans
        console.log('\n📦 Default Subscription Plans:');
        const plans = db.exec('SELECT name, type, price, billingCycle FROM subscription_plans');
        if (plans.length > 0) {
            plans[0].values.forEach(([name, type, price, billing]) => {
                console.log(`   • ${name} (${type}) - NAD ${price} ${billing || ''}`);
            });
        }

        console.log('\n✨ Your Ketu Rental System now has:');
        console.log('   ✅ Subscription management');
        console.log('   ✅ Invoice generation');
        console.log('   ✅ Receipt management');
        console.log('   ✅ Payment tracking');
        console.log('   ✅ Email templates');
        console.log('   ✅ VAT calculations');
        console.log('   ✅ Payment gateways support');

        console.log('\n🚀 Next steps:');
        console.log('   1. Restart your server: npm start');
        console.log('   2. Test the API endpoints');
        console.log('   3. Configure payment gateways in the admin panel');
        console.log('   4. Customize email templates\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run migration
runMigration();
