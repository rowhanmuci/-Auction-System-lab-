<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once(__DIR__ . '/../../config/db.php');

$result = $conn->query('SELECT CategoryID, category_name FROM category ORDER BY category_name');
$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode(['success' => true, 'data' => $categories]);
$conn->close();
