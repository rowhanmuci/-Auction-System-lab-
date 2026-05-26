<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$item_id = isset($_GET['item_id']) ? (int)$_GET['item_id'] : 0;
if ($item_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid item_id']);
    exit;
}

$stmt = $conn->prepare('
    SELECT c.CommentID, c.content, c.post_time,
           c.WriterID, w.name AS writer_name
    FROM comment c
    JOIN user w ON c.WriterID = w.UserID
    WHERE c.ItemID = ?
    ORDER BY c.post_time DESC
');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$result   = $stmt->get_result();
$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => $comments]);
