<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once(__DIR__ . '/../../config/db.php');

$data = json_decode(file_get_contents('php://input'), true);

$id_number = trim($data['id_number'] ?? '');
$name      = trim($data['name']      ?? '');
$phone     = trim($data['phone']     ?? '');
$email     = trim($data['email']     ?? '');
$password  = $data['password']       ?? '';

if (!$id_number || !$name || !$phone || !$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email format']);
    exit;
}

$stmt = $conn->prepare('SELECT UserID FROM user WHERE email = ? OR ID_number = ?');
$stmt->bind_param('ss', $email, $id_number);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Email or ID number already registered']);
    $stmt->close();
    exit;
}
$stmt->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare('INSERT INTO user (ID_number, name, phone, email, password) VALUES (?, ?, ?, ?, ?)');
$stmt->bind_param('sssss', $id_number, $name, $phone, $email, $hashed);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'data' => ['message' => 'Registration successful']]);
} else {
    echo json_encode(['success' => false, 'error' => 'Registration failed']);
}
$stmt->close();
$conn->close();
