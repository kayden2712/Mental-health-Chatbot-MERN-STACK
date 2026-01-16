# HƯỚNG DẪN DEPLOY LÊN PRODUCTION

## 📋 MỤC LỤC
1. [Deploy Backend API](#deploy-backend)
2. [Deploy Database](#deploy-database)
3. [Build Mobile App](#build-mobile-app)
4. [Cấu hình Domain & SSL](#domain-ssl)
5. [Monitoring & Maintenance](#monitoring)

---

## 🚀 DEPLOY BACKEND API

### **Option 1: Deploy lên Render (FREE - Recommended)**

#### Bước 1: Chuẩn bị Backend
```bash
cd Backend
```

Tạo file `package.json` nếu chưa có start script:
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

#### Bước 2: Đăng ký Render
1. Truy cập: https://render.com
2. Đăng ký tài khoản (dùng GitHub để dễ)
3. Click "New +" → "Web Service"

#### Bước 3: Kết nối GitHub
1. Connect repository: `kayden2712/Mental-health-Chatbot-MERN-STACK`
2. Root Directory: `Backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`

#### Bước 4: Cấu hình Environment
Thêm Environment Variables:
```
API_KEY=your_gemini_api_key
DATABASE_URL=your_mysql_connection_string
NODE_ENV=production
PORT=4000
```

#### Bước 5: Deploy
- Click "Create Web Service"
- Đợi deploy xong (~5 phút)
- Nhận được URL: `https://your-app.onrender.com`

---

### **Option 2: Deploy lên Railway (FREE)**

#### Bước 1: Đăng ký Railway
1. Truy cập: https://railway.app
2. Sign up với GitHub
3. Click "New Project" → "Deploy from GitHub repo"

#### Bước 2: Cấu hình
1. Chọn repo `Mental-health-Chatbot-MERN-STACK`
2. Root Directory: `/Backend`
3. Thêm Variables:
   ```
   API_KEY=your_gemini_api_key
   DATABASE_URL=mysql://...
   ```

#### Bước 3: Deploy
- Railway tự động deploy
- Nhận domain: `https://your-app.up.railway.app`

---

### **Option 3: Deploy lên Vercel**

⚠️ **Lưu ý:** Vercel tốt cho serverless, cần chỉnh code một chút

#### Bước 1: Tạo file `vercel.json` trong Backend/
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

#### Bước 2: Install Vercel CLI
```bash
npm install -g vercel
```

#### Bước 3: Deploy
```bash
cd Backend
vercel
# Follow prompts
```

---

### **Option 4: Deploy lên VPS (DigitalOcean, AWS, etc.)**

#### Bước 1: Tạo VPS
- DigitalOcean Droplet ($5/month)
- AWS EC2 (Free tier 12 tháng)
- Google Cloud Compute Engine

#### Bước 2: SSH vào server
```bash
ssh root@your-server-ip
```

#### Bước 3: Cài đặt môi trường
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx
```

#### Bước 4: Clone code
```bash
cd /var/www
git clone https://github.com/kayden2712/Mental-health-Chatbot-MERN-STACK.git
cd Mental-health-Chatbot-MERN-STACK/Backend
npm install
```

#### Bước 5: Cấu hình .env
```bash
nano .env
```
Thêm:
```
API_KEY=your_gemini_api_key
NODE_ENV=production
```

#### Bước 6: Setup MySQL
```bash
mysql -u root -p
```
```sql
CREATE DATABASE healthbot;
USE healthbot;
SOURCE /var/www/Mental-health-Chatbot-MERN-STACK/Backend/database.sql;
EXIT;
```

#### Bước 7: Start với PM2
```bash
pm2 start index.js --name wellbot-api
pm2 save
pm2 startup
```

#### Bước 8: Cấu hình Nginx
```bash
nano /etc/nginx/sites-available/wellbot
```
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/wellbot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🗄️ DEPLOY DATABASE

### **Option 1: PlanetScale (FREE)**

1. Truy cập: https://planetscale.com
2. Tạo database mới
3. Import schema từ `Backend/database.sql`
4. Copy connection string
5. Update trong Backend .env:
   ```
   DATABASE_URL=mysql://...@aws.connect.psdb.cloud/healthbot?ssl={"rejectUnauthorized":true}
   ```

### **Option 2: Railway MySQL**

1. Trong Railway project
2. Click "New" → "Database" → "MySQL"
3. Copy connection string
4. Import schema

### **Option 3: AWS RDS**

1. Tạo RDS MySQL instance
2. Configure security group
3. Import database
4. Update connection string

---

## 📱 BUILD MOBILE APP

### **Build cho Android (APK/AAB)**

#### Bước 1: Cài đặt EAS CLI
```bash
npm install -g eas-cli
```

#### Bước 2: Login Expo
```bash
eas login
```

#### Bước 3: Cấu hình project
```bash
cd mobile
eas build:configure
```

#### Bước 4: Update API URL trong production
Sửa `mobile/constants/api.ts`:
```typescript
const getBaseUrl = () => {
  if (__DEV__) {
    return `http://${YOUR_COMPUTER_IP}:4000`;
  }
  // Production URL - CẬP NHẬT URL SAU KHI DEPLOY BACKEND
  return 'https://your-backend-url.onrender.com';
};
```

#### Bước 5: Build APK
```bash
eas build --platform android --profile preview
```

Hoặc build AAB cho Google Play:
```bash
eas build --platform android --profile production
```

#### Bước 6: Download APK
- EAS sẽ build trên cloud
- Sau ~15 phút, download APK
- Cài trên điện thoại hoặc upload lên Google Play

---

### **Build cho iOS (chỉ trên Mac)**

#### Bước 1: Cần Apple Developer Account ($99/year)

#### Bước 2: Build
```bash
eas build --platform ios --profile production
```

#### Bước 3: Submit lên App Store
```bash
eas submit --platform ios
```

---

### **Publish OTA Updates (Không cần rebuild)**

```bash
cd mobile
eas update --branch production --message "Bug fixes"
```

---

## 🌐 CẤU HÌNH DOMAIN & SSL

### **Option 1: Cloudflare (FREE SSL)**

1. Đăng ký domain (Namecheap, GoDaddy, ~$10/năm)
2. Truy cập: https://cloudflare.com
3. Add site
4. Update nameservers
5. Bật SSL/TLS (Full)
6. Add DNS records:
   ```
   A    @    your-server-ip
   A    api  your-server-ip
   ```

### **Option 2: Let's Encrypt (FREE SSL cho VPS)**

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renew
certbot renew --dry-run
```

---

## 📊 MONITORING & MAINTENANCE

### **Setup Monitoring**

#### PM2 Monitoring (cho VPS)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 monit
```

#### Sentry (Error tracking)
```bash
npm install @sentry/node
```

Trong `Backend/index.js`:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

#### Uptime Monitoring
- UptimeRobot: https://uptimerobot.com (FREE)
- Pingdom
- StatusCake

### **Backup Database**

#### Tự động backup MySQL
```bash
# Tạo script backup
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p healthbot > /backups/healthbot_$DATE.sql
# Giữ 7 ngày
find /backups -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup.sh
# Chạy mỗi ngày lúc 2AM
crontab -e
0 2 * * * /root/backup.sh
```

---

## 🔒 BẢO MẬT PRODUCTION

### **1. Environment Variables**
Không bao giờ commit `.env` lên GitHub:
```bash
# .gitignore
.env
.env.production
```

### **2. Hash Passwords**
Update `Backend/index.js`:
```javascript
const bcrypt = require('bcrypt');

// Signup
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password);
```

### **3. Rate Limiting**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### **4. Helmet (Security headers)**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### **5. CORS Production**
```javascript
const corsOptions = {
  origin: ['https://your-domain.com'],
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 📱 PUBLISH LÊN STORE

### **Google Play Store**

#### Yêu cầu:
- Google Play Console account ($25 one-time)
- AAB file
- Screenshots
- Privacy Policy
- App description

#### Steps:
1. https://play.google.com/console
2. Create app
3. Upload AAB
4. Fill store listing
5. Set pricing (free/paid)
6. Submit for review (~2-3 ngày)

### **Apple App Store**

#### Yêu cầu:
- Apple Developer account ($99/year)
- Mac với Xcode
- IPA file
- Screenshots

#### Steps:
1. https://appstoreconnect.apple.com
2. Create app
3. Upload IPA
4. Fill metadata
5. Submit for review (~1-2 ngày)

---

## 🎯 CHECKLIST TRƯỚC KHI DEPLOY

### Backend:
- [ ] Update CORS cho production domain
- [ ] Setup environment variables
- [ ] Hash passwords với bcrypt
- [ ] Add rate limiting
- [ ] Setup error logging (Sentry)
- [ ] Configure database backups
- [ ] Test all API endpoints
- [ ] Setup SSL certificate

### Mobile:
- [ ] Update API_BASE_URL cho production
- [ ] Test app với production API
- [ ] Add app icons
- [ ] Add splash screen
- [ ] Update app.json (name, version, etc.)
- [ ] Test on real devices
- [ ] Prepare screenshots
- [ ] Write Privacy Policy

### Database:
- [ ] Backup development data
- [ ] Setup production database
- [ ] Import schema
- [ ] Create indexes
- [ ] Setup automated backups

---

## 💰 CHI PHÍ ƯỚC TÍNH

### **FREE Tier (Hoàn toàn miễn phí)**
- Backend: Render/Railway (Free tier)
- Database: PlanetScale (Free 5GB)
- Mobile Build: EAS (Free tier)
- Domain: Freenom (free domain)
- SSL: Let's Encrypt (free)
- **Tổng: $0/month**

### **Basic Tier**
- Backend: VPS DigitalOcean $5/month
- Database: Included in VPS
- Domain: Namecheap $10/year
- Mobile: $0 (build locally)
- **Tổng: ~$6/month**

### **Professional Tier**
- Backend: AWS/GCP $20/month
- Database: AWS RDS $15/month
- CDN: Cloudflare Pro $20/month
- Monitoring: Sentry $26/month
- **Tổng: ~$81/month**

### **App Store Publishing**
- Google Play: $25 (one-time)
- Apple App Store: $99/year

---

## 🆘 TROUBLESHOOTING DEPLOYMENT

### "Build failed on EAS"
```bash
# Clear cache
eas build:configure --clear
# Rebuild
eas build --platform android --clear-cache
```

### "Cannot connect to database"
- Check DATABASE_URL format
- Verify database allows remote connections
- Check firewall/security groups

### "CORS error in production"
- Update CORS origin in Backend
- Ensure HTTPS is used
- Check preflight requests

### "App crashes on startup"
- Check API_BASE_URL is correct
- Verify backend is running
- Check app logs: `adb logcat` (Android)

---

## 📚 TÀI LIỆU THAM KHẢO

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Deploy Node.js to Render](https://render.com/docs/deploy-node-express-app)
- [Railway Deployment](https://docs.railway.app/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Google Play Console](https://play.google.com/console/about/)

---

## 🎉 KẾT LUẬN

Với hướng dẫn này, bạn có thể:
1. ✅ Deploy backend lên cloud (free hoặc trả phí)
2. ✅ Build mobile app thành APK/IPA
3. ✅ Setup database production
4. ✅ Cấu hình domain & SSL
5. ✅ Publish lên App Store/Play Store

**Recommended path cho người mới:**
1. Start với Render (FREE backend hosting)
2. PlanetScale (FREE database)
3. Build APK với EAS
4. Test kỹ trước khi lên store

Good luck! 🚀
