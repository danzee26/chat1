<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$message = '';
if (is_array($data) && isset($data['message'])) {
    $message = trim((string) $data['message']);
} elseif (isset($_POST['message'])) {
    $message = trim((string) $_POST['message']);
}

echo json_encode([
    'reply' => 'вас понял',
    'received' => $message,
]);
