<?php
// Скрипт миграции для создания структуры базы данных MiniChat

$host = getenv('DB_HOST') ?: 'mysql'; // Имя сервиса MySQL в Docker Compose
$user = getenv('DB_USER') ?: 'admin'; // Пользователь
$password = getenv('DB_PASSWORD') ?: 'admin_pass'; // Пароль
$dbname = getenv('DB_NAME') ?: 'minichat_db'; // Имя базы данных

// Подключение к MySQL
$conn = new mysqli($host, $user, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}

// SQL для создания таблицы сообщений
// добавляем chat_id, доступный для мультичатов
$sql = "
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    chat_id INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
";

// Выполнение запроса
if ($conn->query($sql) === TRUE) {
    echo "Таблица 'messages' создана успешно.\n";
} else {
    echo "Ошибка при создании таблицы: " . $conn->error . "\n";
}

// Убедимся, что колонка chat_id существует (для совместимости со старой схемой)
$result = $conn->query("SHOW COLUMNS FROM messages LIKE 'chat_id'");
if ($result && $result->num_rows == 0) {
    $sql_alter = "ALTER TABLE messages ADD COLUMN chat_id INT NOT NULL DEFAULT 1";
    if ($conn->query($sql_alter) === TRUE) {
        echo "Колонка 'chat_id' добавлена успешно.\n";
    } else {
        echo "Ошибка при добавлении колонки chat_id: " . $conn->error . "\n";
    }
} else {
    echo "Колонка 'chat_id' уже существует.\n";
}

// Проверка существования индекса на created_at
$result = $conn->query("SHOW INDEX FROM messages WHERE Key_name = 'idx_created_at'");
if ($result->num_rows == 0) {
    // Создание индекса
    $sql_index = "ALTER TABLE messages ADD INDEX idx_created_at (created_at);";
    if ($conn->query($sql_index) === TRUE) {
        echo "Индекс 'idx_created_at' создан успешно.\n";
    } else {
        echo "Ошибка при создании индекса: " . $conn->error . "\n";
    }
} else {
    echo "Индекс 'idx_created_at' уже существует.\n";
}

// Проверка индекса по chat_id (чтобы ускорить выборки по чату)
$result = $conn->query("SHOW INDEX FROM messages WHERE Key_name = 'idx_chat_id'");
if ($result->num_rows == 0) {
    $sql_index = "ALTER TABLE messages ADD INDEX idx_chat_id (chat_id);";
    if ($conn->query($sql_index) === TRUE) {
        echo "Индекс 'idx_chat_id' создан успешно.\n";
    } else {
        echo "Ошибка при создании индекса idx_chat_id: " . $conn->error . "\n";
    }
} else {
    echo "Индекс 'idx_chat_id' уже существует.\n";
}

// Закрытие подключения
$conn->close();

echo "Миграция завершена.\n";
?>