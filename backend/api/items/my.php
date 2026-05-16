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

$seller_id = $_SESSION['user_id'];

$stmt = $conn->prepare('
    SELECT i.ItemID, i.title, i.starting_price, i.start_time, i.end_time, i.WinnerID,
           c.category_name,
           CASE
               WHEN NOW() < i.start_time THEN \'upcoming\'
               WHEN NOW() > i.end_time   THEN \'ended\'
               ELSE \'active\'
           END AS status,
           (SELECT MAX(b.bid_amount) FROM bid b WHERE b.ItemID = i.ItemID) AS current_price,
           (SELECT ii.image_url FROM item_image ii WHERE ii.ItemID = i.ItemID LIMIT 1) AS thumbnail
    FROM item i
    JOIN category c ON i.CategoryID = c.CategoryID
    WHERE i.SellerID = ?
    ORDER BY i.end_time DESC
');
$stmt->bind_param('i', $seller_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $row['current_price'] = $row['current_price'] ?? $row['starting_price'];
    $items[] = $row;
}
$stmt->close();

echo json_encode(['success' => true, 'data' => $items]);
$conn->close();
