<?php
require_once 'db_connect.php';

header('Content-Type: application/json; charset=utf-8');

try {
  // 1. Получаем лимит (сколько сообщений грузить)
  $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 30;
  if ($limit <= 0) $limit = 30;
  if ($limit > 100) $limit = 100;

  // 2. Получаем ID чата (по умолчанию 1)
  $chatId = isset($_GET['chat_id']) ? (int) $_GET['chat_id'] : 1;

  // 3. Получаем ID сообщения, ДО которого нужно грузить историю (для скролла)
  $beforeId = isset($_GET['before_id']) ? (int) $_GET['before_id'] : null;

  if ($beforeId) {
    // Запрос для подгрузки СТАРЫХ сообщений при скролле вверх
    $sql = "SELECT id, author, text, DATE_FORMAT(created_at, '%H:%i') as time 
                FROM messages 
                WHERE id < :before_id AND chat_id = :chat_id 
                ORDER BY id DESC 
                LIMIT :limit";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':before_id', $beforeId, PDO::PARAM_INT);
  } else {
    // Запрос для ПЕРВОЙ загрузки (самые свежие сообщения)
    $sql = "SELECT id, author, text, DATE_FORMAT(created_at, '%H:%i') as time 
                FROM messages 
                WHERE chat_id = :chat_id 
                ORDER BY id DESC 
                LIMIT :limit";
    $stmt = $pdo->prepare($sql);
  }

  // Привязываем общие параметры
  $stmt->bindValue(':chat_id', $chatId, PDO::PARAM_INT);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

  $stmt->execute();

  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Переворачиваем результат, чтобы в JS они шли по порядку времени (от старых к новым)
  $messages = array_reverse($rows);

  echo json_encode($messages);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
