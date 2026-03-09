<?php
require_once 'db_connect.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 30;
  if ($limit <= 0) {
    $limit = 30;
  }
  if ($limit > 100) {
    $limit = 100;
  }

  $beforeId = isset($_GET['before_id']) ? (int) $_GET['before_id'] : null;

  if ($beforeId) {
    $sql = "SELECT id, author, text, DATE_FORMAT(created_at, '%H:%i') as time 
            FROM messages 
            WHERE id < :before_id 
            ORDER BY id DESC 
            LIMIT $limit";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':before_id', $beforeId, PDO::PARAM_INT);
    $stmt->execute();
  } else {
    $sql = "SELECT id, author, text, DATE_FORMAT(created_at, '%H:%i') as time 
            FROM messages 
            ORDER BY id DESC 
            LIMIT $limit";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
  }

  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $messages = array_reverse($rows);

  echo json_encode($messages);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
