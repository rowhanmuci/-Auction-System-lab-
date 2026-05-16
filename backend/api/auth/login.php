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
require_once(__DIR__ . '/../../config/db.php');

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'Email and password are required']);
    exit;
}

$stmt = $conn->prepare('SELECT UserID, name, email, password FROM user WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

$_SESSION['user_id']   = $user['UserID'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email']= $user['email'];

echo json_encode(['success' => true, 'data' => [
    'user_id' => $user['UserID'],
    'name'    => $user['name'],
    'email'   => $user['email']
]]);
$conn->close();
