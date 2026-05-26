<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

session_start();
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Login required']);
    exit;
}

require_once(__DIR__ . '/../../config/db.php');

$user_id = $_SESSION['user_id'];
$data    = json_decode(file_get_contents('php://input'), true);

if (!empty($data['all'])) {
    $stmt = $conn->prepare('UPDATE notification SET is_read = 1 WHERE user_id = ?');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $stmt->close();
} elseif (!empty($data['ids']) && is_array($data['ids'])) {
    $ids  = array_map('intval', $data['ids']);
    $ph   = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $conn->prepare("UPDATE notification SET is_read = 1 WHERE user_id = ? AND id IN ($ph)");
    $types  = str_repeat('i', count($ids) + 1);
    $params = array_merge([$user_id], $ids);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(['success' => true]);
$conn->close();
