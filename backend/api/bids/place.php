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

$data       = json_decode(file_get_contents('php://input'), true);
$item_id    = (int)($data['item_id']    ?? 0);
$bid_amount = $data['bid_amount']       ?? '';

if ($item_id <= 0 || $bid_amount === '') {
    echo json_encode(['success' => false, 'error' => 'item_id and bid_amount are required']);
    exit;
}

if (!is_numeric($bid_amount) || $bid_amount <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid bid amount']);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare('SELECT SellerID, starting_price, start_time, end_time, title FROM item WHERE ItemID = ?');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$item = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$item) {
    echo json_encode(['success' => false, 'error' => 'Item not found']);
    exit;
}

if ($item['SellerID'] == $user_id) {
    echo json_encode(['success' => false, 'error' => 'Seller cannot bid on own item']);
    exit;
}

$now = date('Y-m-d H:i:s');
if ($now < $item['start_time'] || $now > $item['end_time']) {
    echo json_encode(['success' => false, 'error' => 'Auction is not active']);
    exit;
}

$stmt = $conn->prepare('SELECT MAX(bid_amount) AS max_bid FROM bid WHERE ItemID = ?');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$row     = $stmt->get_result()->fetch_assoc();
$min_bid = $row['max_bid'] ?? $item['starting_price'];
$stmt->close();

if ((float)$bid_amount <= (float)$min_bid) {
    echo json_encode(['success' => false, 'error' => 'Bid must be higher than current price: ' . $min_bid]);
    exit;
}

$stmt = $conn->prepare('INSERT INTO bid (UserID, ItemID, bid_amount) VALUES (?, ?, ?)');
$stmt->bind_param('iid', $user_id, $item_id, $bid_amount);
if ($stmt->execute()) {
    // Notify all other bidders on this item that they've been outbid
    $msg   = '商品「' . $item['title'] . '」有新的出價，你的出價已被超越';
    $notif = $conn->prepare("
        INSERT INTO notification (user_id, type, message, item_id)
        SELECT DISTINCT UserID, 'outbid', ?, ?
        FROM bid
        WHERE ItemID = ? AND UserID != ?
    ");
    $notif->bind_param('siii', $msg, $item_id, $item_id, $user_id);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'data' => ['bid_id' => $conn->insert_id, 'bid_amount' => $bid_amount]]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to place bid']);
}
$stmt->close();
$conn->close();
