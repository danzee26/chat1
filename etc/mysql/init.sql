-- Инициализация базы данных MiniChat
CREATE DATABASE IF NOT EXISTS minichat_db;

USE minichat_db;

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для оптимизации запросов по времени создания
CREATE INDEX idx_created_at ON messages (created_at);