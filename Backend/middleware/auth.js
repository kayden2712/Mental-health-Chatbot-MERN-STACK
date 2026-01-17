const jwt = require('jsonwebtoken');

// Secret keys
const JWT_SECRET = process.env.JWT_SECRET || "secret_chat";
const CLINIC_SECRET = process.env.CLINIC_SECRET || "clinic_secret_key_2024";

// Middleware xác thực user
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Middleware xác thực phòng khám
const authenticateClinic = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token required' });
    }
    try {
        const decoded = jwt.verify(token, CLINIC_SECRET);
        req.clinic = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

module.exports = {
    JWT_SECRET,
    CLINIC_SECRET,
    authenticateUser,
    authenticateClinic
};
