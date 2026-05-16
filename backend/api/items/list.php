<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

if ($category_id > 0) {
    $stmt = $conn->prepare('
        SELECT i.ItemID, i.title, i.description, i.starting_price, i.start_time, i.end_time,
               u.name AS seller_name,
               c.category_name,
               (SELECT MAX(b.bid_amount) FROM bid b WHERE b.ItemID = i.ItemID) AS current_price,
               (SELECT ii.image_url FROM item_image ii WHERE ii.ItemID = i.ItemID LIMIT 1) AS thumbnail
        FROM item i
        JOIN user u     ON i.SellerID   = u.UserID
        JOIN category c ON i.CategoryID = c.CategoryID
        WHERE i.CategoryID = ?
          AND NOW() BETWEEN i.start_time AND i.end_time
        ORDER BY i.end_time ASC
    ');
    $stmt->bind_param('i', $category_id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query('
        SELECT i.ItemID, i.title, i.description, i.starting_price, i.start_time, i.end_time,
               u.name AS seller_name,
               c.category_name,
               (SELECT MAX(b.bid_amount) FROM bid b WHERE b.ItemID = i.ItemID) AS current_price,
               (SELECT ii.image_url FROM item_image ii WHERE ii.ItemID = i.ItemID LIMIT 1) AS thumbnail
        FROM item i
        JOIN user u     ON i.SellerID   = u.UserID
        JOIN category c ON i.CategoryID = c.CategoryID
        WHERE NOW() BETWEEN i.start_time AND i.end_time
        ORDER BY i.end_time ASC
    ');
}

$items = [];
while ($row = $result->fetch_assoc()) {
    $row['current_price'] = $row['current_price'] ?? $row['starting_price'];
    $items[] = $row;
}

echo json_encode(['success' => true, 'data' => $items]);
$conn->close();
