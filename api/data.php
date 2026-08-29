<?php
header('Content-Type: application/json');

// الاتصال بقاعدة البيانات
$db = new mysqli('localhost', 'anubis', 'password', 'anubis_db');

if ($db->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// جلب البيانات
$query = "SELECT * FROM captured_data ORDER BY timestamp DESC LIMIT 100";
$result = $db->query($query);

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row['data'];
}

echo json_encode(['logs' => $logs]);

$db->close();
?>
