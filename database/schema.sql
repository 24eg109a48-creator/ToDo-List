-- ============================================================
-- SmartTask database schema (MySQL 8+)
-- Run with:  mysql -u root -p < database/schema.sql
--
-- NOTE: This file is optional. The Spring Boot app creates/updates the
-- same tables automatically (spring.jpa.hibernate.ddl-auto=update).
-- It is included so you can show the database design in your report/viva.
-- ============================================================

CREATE DATABASE IF NOT EXISTS smarttask_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smarttask_db;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL COMMENT 'BCrypt hash, never plain text',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- tasks  (one user -> many tasks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(100) NOT NULL,
    description  VARCHAR(500) NULL,
    due_date     DATE         NOT NULL,
    priority     VARCHAR(20)  NOT NULL COMMENT 'LOW | MEDIUM | HIGH',
    status       VARCHAR(20)  NOT NULL COMMENT 'PENDING | IN_PROGRESS | COMPLETED',
    created_at   DATETIME(6)  NOT NULL,
    updated_at   DATETIME(6)  NOT NULL,
    user_id      BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_tasks_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_user_status (user_id, status),
    INDEX idx_tasks_due_date (due_date)
) ENGINE = InnoDB;
