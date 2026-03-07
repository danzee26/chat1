<?php
require_once 'db_connect.php'; // Подключаем базу

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim((string)($input['message'] ?? ''));

if ($message !== '') {
    // 1. Сохраняем ТВОЁ сообщение
    $stmt = $pdo->prepare("INSERT INTO messages (author, text) VALUES (?, ?)");
    $stmt->execute(['user', $message]);

    // 2. Генерируем ответ бота
    $replyText = 'вас понял';

    // 3. Сохраняем ответ БОТА
    $stmt->execute(['bot', $replyText]);

    echo json_encode([
        'reply' => $replyText,
        'received' => $message,
    ]);
} else {
    echo json_encode(['error' => 'Empty message']);
}
