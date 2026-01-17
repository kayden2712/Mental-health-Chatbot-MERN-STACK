# 🚀 Hướng Dẫn Deploy Backend Lên Railway

## Bước 1: Chuẩn Bị

### 1.1 Đăng ký tài khoản Railway
- Truy cập: https://railway.app/
- Đăng ký/Đăng nhập bằng GitHub

### 1.2 Cài đặt Railway CLI (Tùy chọn)
```bash
npm install -g @railway/cli
railway login
```

## Bước 2: Deploy Backend

### 2.1 Tạo Project mới trên Railway

1. **Truy cập Railway Dashboard**: https://railway.app/dashboard
2. **Tạo Project mới**: Click "New Project"
3. **Chọn "Deploy from GitHub repo"** hoặc "Empty Project"

### 2.2 Deploy từ GitHub (Khuyến nghị)

#### A. Push code lên GitHub trước
```bash
cd Backend
git init
git add .
git commit -m "Initial commit for Railway deployment"
# Tạo repo mới trên GitHub và push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

#### B. Connect Repository trên Railway
1. Chọn "Deploy from GitHub repo"
2. Chọn repository của bạn
3. Chọn thư mục `Backend` làm Root Directory
4. Railway sẽ tự động detect và deploy

### 2.3 Deploy thủ công (Nếu không dùng GitHub)

#### A. Sử dụng Railway CLI
```bash
cd Backend
railway init
railway up
```

## Bước 3: Setup MySQL Database

### 3.1 Thêm MySQL Plugin
1. Trong Railway Project, click **"+ New"**
2. Chọn **"Database"** → **"Add MySQL"**
3. Railway sẽ tự động tạo database và cung cấp connection details

### 3.2 Connect Database với Backend

1. Click vào **MySQL service**
2. Vào tab **"Variables"**
3. Copy các biến sau:
   - `MYSQL_URL` (hoặc `DATABASE_URL`)
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### 3.3 Import Database Schema

#### Option 1: Sử dụng Railway CLI
```bash
# Connect đến MySQL
railway connect mysql

# Sau đó chạy SQL commands
SOURCE database.sql;
```

#### Option 2: Sử dụng MySQL Workbench hoặc DBeaver
1. Lấy connection string từ Railway Variables
2. Connect với client MySQL của bạn
3. Import file `database.sql`

#### Option 3: Chạy setup script
```bash
# Cập nhật .env với Railway database credentials
railway run node setup-database.js
```

## Bước 4: Configure Environment Variables

### 4.1 Trong Railway Dashboard
1. Click vào **Backend service**
2. Vào tab **"Variables"**
3. Thêm các biến sau:

```env
# Database - Railway sẽ tự động set, nhưng bạn có thể override
MYSQL_URL=${MYSQL.MYSQL_URL}

# Hoặc dùng riêng lẻ:
DB_HOST=${MYSQL.MYSQLHOST}
DB_USER=${MYSQL.MYSQLUSER}
DB_PASSWORD=${MYSQL.MYSQLPASSWORD}
DB_NAME=${MYSQL.MYSQLDATABASE}

# Server
PORT=4000

# JWT Secret (QUAN TRỌNG: Thay đổi giá trị này!)
JWT_SECRET=your-super-secret-jwt-key-change-this-now

# Gemini API Key (Lấy từ Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4.2 Lấy Gemini API Key
1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy và paste vào Railway Variables

## Bước 5: Deploy & Verify

### 5.1 Trigger Deploy
- Railway sẽ tự động deploy khi có thay đổi
- Hoặc click **"Deploy"** manually

### 5.2 Kiểm tra Logs
1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Xem logs để đảm bảo:
   - ✓ Database connected successfully
   - Server is running on port 4000

### 5.3 Lấy Production URL
1. Vào tab **"Settings"**
2. Trong **"Domains"** section
3. Railway sẽ cung cấp URL dạng: `https://your-app.up.railway.app`
4. **Copy URL này** để cập nhật trong mobile app

## Bước 6: Cập Nhật Mobile App

1. Mở file: `mobile/constants/api.ts`
2. Thay thế `RAILWAY_PRODUCTION_URL`:
```typescript
const RAILWAY_PRODUCTION_URL = 'https://your-app.up.railway.app';
```

3. Build APK với production config

## ⚠️ Lưu Ý Quan Trọng

### 1. CORS Configuration
Backend đã được cấu hình để chấp nhận requests từ mọi nguồn (`origin: '*'`). 
Trong production, bạn nên giới hạn origin cụ thể:

```javascript
const corsOptions = {
    origin: ['https://your-domain.com', 'myapp://'],
    credentials: true,
    optionsSuccessStatus: 200
};
```

### 2. Database Security
- Không commit file `.env` vào Git
- Thay đổi JWT_SECRET thành giá trị ngẫu nhiên mạnh
- Railway MySQL đã có SSL mặc định

### 3. Monitoring
- Kiểm tra logs thường xuyên: `railway logs`
- Setup alerts trong Railway Dashboard
- Monitor database usage

### 4. Railway Free Tier Limits
- 500 hours/month execution time
- $5 free credit mỗi tháng
- Sau khi hết, app sẽ sleep (có thể thêm credit card)

## 🔧 Troubleshooting

### Database connection failed
```bash
# Kiểm tra variables
railway variables

# Kiểm tra MySQL status
railway status

# Xem logs
railway logs
```

### Port binding error
Railway tự động set biến `PORT`. Đảm bảo code sử dụng:
```javascript
const port = process.env.PORT || 4000;
```

### Build fails
```bash
# Xem build logs
railway logs --deployment

# Rebuild
railway up --detach
```

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app/
- Railway MySQL: https://docs.railway.app/databases/mysql
- Railway CLI: https://docs.railway.app/develop/cli

---

**Hoàn thành!** Backend của bạn đã sẵn sàng trên Railway! 🎉
