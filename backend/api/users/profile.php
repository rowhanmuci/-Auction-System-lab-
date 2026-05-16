<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($user_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid user_id']);
    exit;
}

$stmt = $conn->prepare('SELECT UserID, name FROM user WHERE UserID = ?');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

echo json_encode(['success' => true, 'data' => ['user_id' => $user['UserID'], 'name' => $user['name']]]);
$conn->close();
