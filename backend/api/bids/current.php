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
    SELECT b.bid_amount, b.bid_time, u.name AS bidder_name, u.UserID AS bidder_id
    FROM bid b JOIN user u ON b.UserID = u.UserID
    WHERE b.ItemID = ?
    ORDER BY b.bid_amount DESC LIMIT 1
');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$top = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if ($top) {
    echo json_encode(['success' => true, 'data' => $top]);
} else {
    echo json_encode(['success' => true, 'data' => null]);
}
