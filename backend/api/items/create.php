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

$data          = json_decode(file_get_contents('php://input'), true);
$title         = trim($data['title']         ?? '');
$description   = trim($data['description']   ?? '');
$starting_price= $data['starting_price']     ?? '';
$start_time    = trim($data['start_time']    ?? '');
$end_time      = trim($data['end_time']      ?? '');
$category_id   = (int)($data['category_id'] ?? 0);
$images        = $data['images']             ?? [];

if (!$title || $starting_price === '' || !$start_time || !$end_time || $category_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'title, starting_price, start_time, end_time, category_id are required']);
    exit;
}

if (!is_numeric($starting_price) || $starting_price < 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid starting_price']);
    exit;
}

if ($end_time <= $start_time) {
    echo json_encode(['success' => false, 'error' => 'end_time must be after start_time']);
    exit;
}

$seller_id = $_SESSION['user_id'];

$conn->begin_transaction();
try {
    $stmt = $conn->prepare('
        INSERT INTO item (title, description, starting_price, start_time, end_time, SellerID, CategoryID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->bind_param('ssdssii', $title, $description, $starting_price, $start_time, $end_time, $seller_id, $category_id);
    $stmt->execute();
    $item_id = $conn->insert_id;
    $stmt->close();

    if (!empty($images)) {
        $img_stmt = $conn->prepare('INSERT INTO item_image (image_url, ItemID) VALUES (?, ?)');
        foreach ($images as $url) {
            $url = trim($url);
            if ($url) {
                $img_stmt->bind_param('si', $url, $item_id);
                $img_stmt->execute();
            }
        }
        $img_stmt->close();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'data' => ['item_id' => $item_id]]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => 'Failed to create item']);
}
$conn->close();
