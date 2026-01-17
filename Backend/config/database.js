const mysql = require('mysql2/promise');

// Tạo pool kết nối MySQL
// Railway cung cấp MYSQL_URL hoặc các biến riêng lẻ
const createDbPool = () => {
    // Nếu có MYSQL_URL (Railway format), sử dụng nó
    if (process.env.MYSQL_URL) {
        return mysql.createPool(process.env.MYSQL_URL);
    }
    
    // Nếu không, sử dụng các biến riêng lẻ
    return mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "12345",
        database: process.env.DB_NAME || "healthbot",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

const db = createDbPool();

// Test database connection
const testConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        console.error('Please ensure MySQL is running and the database exists');
    }
};

module.exports = { db, testConnection };
