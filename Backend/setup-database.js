// Script thiết lập cơ sở dữ liệu
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    let connection;
    
    try {
        // Lấy mật khẩu MySQL từ biến môi trường hoặc sử dụng chuỗi rỗng
        const dbPassword = process.env.DB_PASSWORD || "";
        
        // Kết nối tới MySQL mà không chỉ định cơ sở dữ liệu
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: dbPassword,
        });

        console.log('✓ Connected to MySQL');

        // Tạo cơ sở dữ liệu nếu chưa tồn tại
        console.log('Creating database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS healthbot');
        console.log('✓ Database "healthbot" created or already exists');

        // Sử dụng cơ sở dữ liệu
        await connection.query('USE healthbot');

        // Đọc và thực thi file SQL
        const sqlPath = path.join(__dirname, 'database.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Tách theo dấu chấm phẩy và thực thi từng câu lệnh
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log('Creating tables...');
        for (const statement of statements) {
            if (statement.includes('CREATE DATABASE')) continue; // Bỏ qua CREATE DATABASE
            if (statement.includes('USE healthbot')) continue; // Bỏ qua USE
            
            await connection.query(statement);
        }

        console.log('✓ Tables created successfully');
        
        // Xác minh các bảng
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

// Chạy thiết lập
setupDatabase();
