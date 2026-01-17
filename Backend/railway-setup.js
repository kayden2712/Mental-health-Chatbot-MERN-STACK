// Script để tự động setup database khi deploy lên Railway
// Railway sẽ chạy script này sau khi deploy
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🔄 Setting up database on Railway...\n');
    
    try {
        // Railway cung cấp MYSQL_URL qua environment variable
        if (!process.env.MYSQL_URL) {
            console.log('⚠️  No MYSQL_URL found, skipping database setup');
            return;
        }

        const connection = await mysql.createConnection(process.env.MYSQL_URL);
        console.log('✓ Connected to Railway MySQL\n');
        
        // Đọc file SQL
        const sqlFile = path.join(__dirname, 'database-railway.sql');
        
        if (!fs.existsSync(sqlFile)) {
            console.log('⚠️  database-railway.sql not found, skipping');
            return;
        }
        
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        console.log('✓ Read SQL file\n');
        
        // Execute SQL với multipleStatements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        for (const statement of statements) {
            await connection.query(statement);
        }
        
        console.log('✓ Database tables created!\n');
        
        // Verify
        const [tables] = await connection.query('SHOW TABLES');
        console.log('📊 Tables:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        await connection.end();
        console.log('\n✅ Database setup completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        // Không exit(1) để không fail deployment
    }
}

setupDatabase();
