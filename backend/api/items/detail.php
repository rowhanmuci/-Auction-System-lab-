<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();
require_once(__DIR__ . '/../../config/db.php');

$item_id = isset($_GET['item_id']) ? (int)$_GET['item_id'] : 0;
if ($item_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid item_id']);
    exit;
}

// Fetch item with seller and category info
$stmt = $conn->prepare('
    SELECT i.ItemID, i.title, i.description, i.starting_price, i.start_time, i.end_time,
           i.SellerID, i.WinnerID,
           u.name AS seller_name, u.email AS seller_email,
           c.category_name
    FROM item i
    JOIN user u     ON i.SellerID   = u.UserID
    JOIN category c ON i.CategoryID = c.CategoryID
    WHERE i.ItemID = ?
');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$item = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$item) {
    echo json_encode(['success' => false, 'error' => 'Item not found']);
    exit;
}

// Fetch images
$stmt = $conn->prepare('SELECT image_url FROM item_image WHERE ItemID = ?');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$img_result = $stmt->get_result();
$images = [];
while ($row = $img_result->fetch_assoc()) {
    $images[] = $row['image_url'];
}
$stmt->close();

// Fetch current highest bid
$stmt = $conn->prepare('
    SELECT b.bid_amount, b.bid_time, u.name AS bidder_name
    FROM bid b JOIN user u ON b.UserID = u.UserID
    WHERE b.ItemID = ?
    ORDER BY b.bid_amount DESC LIMIT 1
');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$top_bid = $stmt->get_result()->fetch_assoc();
$stmt->close();

$item['images']        = $images;
$item['current_price'] = $top_bid ? $top_bid['bid_amount'] : $item['starting_price'];
$item['top_bidder']    = $top_bid ? $top_bid['bidder_name'] : null;

// Auction end check: ended + WinnerID still NULL → set winner + send email
$now = new DateTime();
$end = new DateTime($item['end_time']);
if ($now > $end && $item['WinnerID'] === null) {
    $stmt = $conn->prepare('
        SELECT b.UserID, u.email, u.name
        FROM bid b JOIN user u ON b.UserID = u.UserID
        WHERE b.ItemID = ?
        ORDER BY b.bid_amount DESC LIMIT 1
    ');
    $stmt->bind_param('i', $item_id);
    $stmt->execute();
    $winner = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($winner) {
        $upd = $conn->prepare('UPDATE item SET WinnerID = ? WHERE ItemID = ?');
        $upd->bind_param('ii', $winner['UserID'], $item_id);
        $upd->execute();
        $upd->close();
        $item['WinnerID'] = $winner['UserID'];

        // Send winner email (suppress output, errors non-fatal)
        require_once(__DIR__ . '/../../../email/notify_winner.php');
        notify_winner($winner['email'], $winner['name'], $item['title']);

        // In-app notification for winner
        $won_msg   = '恭喜！你得標了「' . $item['title'] . '」';
        $won_notif = $conn->prepare("INSERT INTO notification (user_id, type, message, item_id) VALUES (?, 'won', ?, ?)");
        $won_notif->bind_param('isi', $winner['UserID'], $won_msg, $item_id);
        $won_notif->execute();
        $won_notif->close();
    }
}

echo json_encode(['success' => true, 'data' => $item]);
$conn->close();
