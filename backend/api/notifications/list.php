<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Login required']);
    exit;
}

require_once(__DIR__ . '/../../config/db.php');

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare('
    SELECT id, type, message, item_id, is_read, created_at
    FROM notification
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$rows = $stmt->get_result();
$notifications = [];
$unread = 0;
while ($row = $rows->fetch_assoc()) {
    $notifications[] = $row;
    if (!$row['is_read']) $unread++;
}
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => [
    'notifications' => $notifications,
    'unread_count'  => $unread,
]]);
