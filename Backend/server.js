// server.js - Main application file
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import configurations
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const bookingRoutes = require('./routes/booking');
const clinicRoutes = require('./routes/clinic');

// Initialize Express app
const app = express();

// ----------------- CORS Configuration -----------------
const corsOptions = {
    origin: '*', // Cho phép tất cả nguồn cho phát triển mobile
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'admin'))); // Phục vụ trang admin

const port = process.env.PORT || 4000;

// ----------------- Test Database Connection -----------------
testConnection();

// ----------------- Routes -----------------
// Auth routes
app.use('/', authRoutes);

// Chat routes
app.use('/', chatRoutes);

// Booking routes
app.use('/', bookingRoutes);

// Clinic admin routes
app.use('/clinic', clinicRoutes);

// ----------------- Start Server -----------------
app.listen(port, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`✓ Server running on port ${port}`);
    console.log(`✓ API URL: http://localhost:${port}`);
    console.log(`✓ For mobile: http://YOUR_IP:${port}`);
    console.log(`=================================\n`);
});
