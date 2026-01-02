# Hướng dẫn chuyển đổi từ MongoDB sang MySQL

## Các bước thực hiện:

### 1. Cài đặt MySQL
- Tải và cài đặt MySQL từ: https://dev.mysql.com/downloads/mysql/
- Hoặc sử dụng XAMPP/WAMP để cài MySQL dễ dàng hơn

### 2. Tạo Database
Có 2 cách:

**Cách 1: Sử dụng MySQL Command Line**
```bash
mysql -u root -p
```
Sau đó chạy file SQL:
```sql
source d:/Development/IdeaProjects/Mental-health-Chatbot-MERN-STACK/Backend/database.sql
```

**Cách 2: Sử dụng phpMyAdmin (nếu dùng XAMPP/WAMP)**
- Mở phpMyAdmin (http://localhost/phpmyadmin)
- Tạo database tên `healthbot`
- Import file `database.sql`

### 3. Cấu hình kết nối MySQL
Trong file `Backend/index.js` và `Backend/help.js`, đã có cấu hình MySQL:

```javascript
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",  // Thay đổi nếu MySQL có mật khẩu
    database: "healthbot",
});
```

**Lưu ý:** Nếu MySQL của bạn có mật khẩu, hãy cập nhật trường `password`.

### 4. Cài đặt dependencies mới
```bash
cd Backend
npm install
```

### 5. Chạy server
```bash
npm start
```

## So sánh MongoDB vs MySQL

### Schema MongoDB (Cũ):
```javascript
// User Schema
{
  name: String,
  email: String (unique),
  password: String,
  createdAt: Date,
  updatedAt: Date
}

// Booking Schema
{
  userId: ObjectId,
  name: String,
  phone: String,
  age: Number,
  address: String,
  timeslot: String,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Schema MySQL (Mới):
```sql
-- users table
id (INT, AUTO_INCREMENT, PRIMARY KEY)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password (VARCHAR)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)

-- bookings table
id (INT, AUTO_INCREMENT, PRIMARY KEY)
userId (INT, FOREIGN KEY → users.id)
name (VARCHAR)
phone (VARCHAR)
age (INT)
address (TEXT)
timeslot (VARCHAR)
date (DATE)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```(MySQL với mysql2):
```javascript
const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "healthbot",
});

const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
const user = rows[0];
```

## Kiểm tra kết nối
Sau khi chạy server, bạn sẽ thấy message:
```
✅ MySQL connected!
Server running on port 4000
```

## Troubleshooting

### Lỗi: "Cannot connect to MySQL"
- Kiểm tra MySQL service đã chạy chưa
- Kiểm tra username/password trong config
- Kiểm tra database `healthbot` đã được tạo chưa

### Lỗi: "ER_NO_SUCH_TABLE"
- Chạy lại file `database.sql` để tạo tables

### Lỗi: "ER_ACCESS_DENIED_ERROR"
- Kiểm tra lại username và password MySQL
