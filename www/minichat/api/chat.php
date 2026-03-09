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
$chatId = isset($input['chat_id']) ? (int)$input['chat_id'] : 1;

if ($message !== '') {

    // 1. Сохраняем ТВОЁ сообщение
    $stmt = $pdo->prepare("INSERT INTO messages (author, text, chat_id) VALUES (?, ?, ?)");
    $stmt->execute(['user', $message, $chatId]);

    // 2. Генерируем ответ бота
    $replyText = 'вас понял';

    // 3. Сохраняем ответ БОТА
    $stmt->execute(['bot', $replyText, $chatId]);

    echo json_encode([
        'reply' => $replyText,
        'received' => $message,
        'chat_id' => $chatId
    ]);
} else {
    echo json_encode(['error' => 'Empty message']);
}
