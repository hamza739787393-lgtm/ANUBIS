<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$device_id = $input['device_id'];
$command = $input['command'];

// الاتصال بقاعدة البيانات
$db = new mysqli('localhost', 'anubis', 'password', 'anubis_db');

if ($db->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// حفظ الأمر
$query = "INSERT INTO commands (device_id, command, status) VALUES (?, ?, 'pending')";
$stmt = $db->prepare($query);
$stmt->bind_param('ss', $device_id, $command);
$stmt->execute();

echo json_encode(['success' => true, 'command_id' => $db->insert_id]);

$db->close();
?>
