<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$q = trim($_GET['q'] ?? '');
if ($q === '') {
    echo json_encode(['success' => false, 'error' => 'Query required']);
    exit;
}

$stmt = $conn->prepare('
    SELECT i.ItemID, i.title, i.description, i.starting_price, i.start_time, i.end_time,
           u.name AS seller_name,
           c.category_name,
           (SELECT MAX(b.bid_amount) FROM bid b WHERE b.ItemID = i.ItemID) AS current_price,
           (SELECT ii.image_url FROM item_image ii WHERE ii.ItemID = i.ItemID LIMIT 1) AS thumbnail
    FROM item i
    JOIN user u     ON i.SellerID   = u.UserID
    JOIN category c ON i.CategoryID = c.CategoryID
    WHERE (i.title LIKE CONCAT(\'%\',?,\'%\') OR i.description LIKE CONCAT(\'%\',?,\'%\'))
      AND NOW() BETWEEN i.start_time AND i.end_time
    ORDER BY i.end_time ASC
');
$stmt->bind_param('ss', $q, $q);
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
