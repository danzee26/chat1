<?php
require_once 'db_connect.php';

header('Content-Type: application/json; charset=utf-8');

try {
  // Выбираем все сообщения, старые будут вверху
  $stmt = $pdo->query("SELECT author, text, DATE_FORMAT(created_at, '%H:%i') as time FROM messages ORDER BY id ASC");
  $messages = $stmt->fetchAll();

  echo json_encode($messages);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
