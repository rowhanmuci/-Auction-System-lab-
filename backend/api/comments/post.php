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

$data         = json_decode(file_get_contents('php://input'), true);
$board_owner  = (int)($data['board_owner_id'] ?? 0);
$content      = trim($data['content']         ?? '');

if ($board_owner <= 0 || !$content) {
    echo json_encode(['success' => false, 'error' => 'board_owner_id and content are required']);
    exit;
}

$writer_id = $_SESSION['user_id'];

$stmt = $conn->prepare('INSERT INTO comment (content, WriterID, BoardOwnerID) VALUES (?, ?, ?)');
$stmt->bind_param('sii', $content, $writer_id, $board_owner);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'data' => ['comment_id' => $conn->insert_id]]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to post comment']);
}
$stmt->close();
$conn->close();
