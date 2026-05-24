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

if (empty($_FILES['image'])) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
    exit;
}

$file     = $_FILES['image'];
$maxBytes = 5 * 1024 * 1024; // 5 MB
$allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Upload error: ' . $file['error']]);
    exit;
}

if ($file['size'] > $maxBytes) {
    echo json_encode(['success' => false, 'error' => 'File too large (max 5 MB)']);
    exit;
}

// Verify MIME type from actual file content, not client-supplied type
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
if (!in_array($mimeType, $allowed, true)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Allowed: jpg, png, webp, gif']);
    exit;
}

$ext      = match($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
};
$filename = uniqid('img_', true) . '.' . $ext;
$uploadDir = __DIR__ . '/../../../../uploads/';
$destPath  = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
    exit;
}

echo json_encode(['success' => true, 'data' => ['url' => '/auction/uploads/' . $filename]]);
