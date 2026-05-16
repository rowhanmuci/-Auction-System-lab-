<?php
$host   = 'localhost';
$user   = 'root';
$pass   = '';
$dbname = 'auction';

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'DB connection failed: ' . $conn->connect_error]));
}
