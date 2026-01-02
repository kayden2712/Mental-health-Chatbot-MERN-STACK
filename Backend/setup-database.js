// Database setup script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    let connection;
    
    try {
        // Get MySQL password from environment or use empty string
        const dbPassword = process.env.DB_PASSWORD || "";
        
        // Connect to MySQL without specifying a database
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: dbPassword,
        });

        console.log('✓ Connected to MySQL');

        // Create database if it doesn't exist
        console.log('Creating database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS healthbot');
        console.log('✓ Database "healthbot" created or already exists');

        // Use the database
        await connection.query('USE healthbot');

        // Read and execute the SQL file
        const sqlPath = path.join(__dirname, 'database.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log('Creating tables...');
        for (const statement of statements) {
            if (statement.includes('CREATE DATABASE')) continue; // Skip CREATE DATABASE
            if (statement.includes('USE healthbot')) continue; // Skip USE
            
            await connection.query(statement);
        }

        console.log('✓ Tables created successfully');
        
        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nCreated tables:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });

        console.log('\n✓ Database setup completed successfully!\n');

    } catch (err) {
        console.error('\n✗ Error setting up database:');
        console.error(err.message);
        
        if (err.code === 'ECONNREFUSED') {
            console.error('\n⚠ MySQL server is not running.');
            console.error('Please start MySQL using one of these methods:');
            console.error('  - XAMPP Control Panel: Start MySQL');
            console.error('  - Command: net start mysql');
            console.error('  - Services: Start MySQL80 service\n');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n⚠ MySQL authentication failed.');
            console.error('Solutions:');
            console.error('  1. If your MySQL root user has a password, create a .env file with:');
            console.error('     DB_PASSWORD=your_mysql_password');
            console.error('  2. Or set MySQL root password to empty (not recommended for production)\n');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the setup
setupDatabase();
