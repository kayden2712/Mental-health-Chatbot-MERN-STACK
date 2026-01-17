// Script để import database schema lên Railway MySQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
    console.log('🔄 Starting database import...\n');
    
    try {
        // Connect to Railway MySQL
        const connection = await mysql.createConnection(
            process.env.MYSQL_URL || {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                multipleStatements: true
            }
        );
        
        console.log('✓ Connected to Railway MySQL\n');
        
        // Read SQL file (Railway version without USE database command)
        const sqlFilePath = path.join(__dirname, 'database-railway.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('✓ Read database-railway.sql file\n');
        console.log('🔄 Executing SQL statements...\n');
        
        // Execute SQL
        await connection.query(sqlContent);
        
        console.log('✓ Database schema imported successfully!\n');
        
        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📊 Tables created:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        await connection.end();
        console.log('\n✅ Import completed successfully!');
        
    } catch (error) {
        console.error('❌ Error importing database:', error.message);
        process.exit(1);
    }
}

importDatabase();
