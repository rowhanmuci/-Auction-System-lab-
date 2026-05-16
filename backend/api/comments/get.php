<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($user_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid user_id']);
    exit;
}

$stmt = $conn->prepare('
    SELECT c.CommentID, c.content, c.post_time,
           c.WriterID, w.name AS writer_name
    FROM comment c
    JOIN user w ON c.WriterID = w.UserID
    WHERE c.BoardOwnerID = ?
    ORDER BY c.post_time DESC
');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result   = $stmt->get_result();
$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => $comments]);
