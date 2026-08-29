<?php
header('Content-Type: application/json');

// الاتصال بقاعدة البيانات
$db = new mysqli('localhost', 'anubis', 'password', 'anubis_db');

if ($db->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// جلب الأجهزة
$query = "SELECT * FROM devices ORDER BY last_seen DESC";
$result = $db->query($query);

$devices = [];
while ($row = $result->fetch_assoc()) {
    $row['online'] = (time() - strtotime($row['last_seen'])) < 60;
    $devices[] = $row;
}

echo json_encode(['devices' => $devices]);

$db->close();
?>
