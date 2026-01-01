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

        // Split SQL statements (simple split by semicolon)
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip comments
            if (statement.startsWith('--') || statement.length === 0) {
                continue;
            }

            try {
                db.run(statement);
                successCount++;

                // Log progress for CREATE TABLE statements
                if (statement.includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1];
                    console.log(`✅ Created table: ${tableName}`);
                } else if (statement.includes('INSERT INTO')) {
                    const tableName = statement.match(/INSERT INTO (\w+)/)?.[1];
                    if (tableName) {
                        skipCount++;
                    }
                } else if (statement.includes('CREATE INDEX')) {
                    const indexName = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/)?.[1];
                    console.log(`📊 Created index: ${indexName}`);
                }
            } catch (error) {
                console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                console.error(`Statement: ${statement.substring(0, 100)}...`);
            }
        }

        // Save database
        saveDatabase();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration completed successfully!');
        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   • Total statements: ${statements.length}`);
        console.log(`   • Successfully executed: ${successCount}`);
        console.log(`   • Default data inserted: ${skipCount > 0 ? 'Yes' : 'No'}`);

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
