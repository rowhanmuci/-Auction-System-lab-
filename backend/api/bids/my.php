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
    SELECT b.BidID, b.bid_amount, b.bid_time,
           i.ItemID, i.title, i.end_time, i.starting_price, i.WinnerID,
           c.category_name,
           (SELECT MAX(b2.bid_amount) FROM bid b2 WHERE b2.ItemID = i.ItemID) AS top_bid,
           (SELECT ii.image_url FROM item_image ii WHERE ii.ItemID = i.ItemID LIMIT 1) AS thumbnail,
           CASE WHEN NOW() > i.end_time THEN \'ended\' ELSE \'active\' END AS auction_status
    FROM bid b
    JOIN item i     ON b.ItemID     = i.ItemID
    JOIN category c ON i.CategoryID = c.CategoryID
    WHERE b.UserID = ?
    ORDER BY b.bid_amount DESC
');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

// Deduplicate: keep highest bid per item
$seen  = [];
$bids  = [];
while ($row = $result->fetch_assoc()) {
    if (isset($seen[$row['ItemID']])) continue;
    $seen[$row['ItemID']] = true;
    $row['is_winning'] = (float)$row['bid_amount'] === (float)$row['top_bid'];
    $bids[] = $row;
}
$stmt->close();

echo json_encode(['success' => true, 'data' => $bids]);
$conn->close();
