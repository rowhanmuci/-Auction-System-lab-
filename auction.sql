-- Online Auction System Database
-- Usage: Import via phpMyAdmin or run: mysql -u root < auction.sql

CREATE DATABASE IF NOT EXISTS auction CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auction;

-- =====================
-- 1. USER
-- =====================
CREATE TABLE IF NOT EXISTS user (
    UserID    INT          AUTO_INCREMENT PRIMARY KEY,
    ID_number VARCHAR(10)  NOT NULL UNIQUE,
    name      VARCHAR(50)  NOT NULL,
    phone     VARCHAR(20)  NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 2. CATEGORY
-- =====================
CREATE TABLE IF NOT EXISTS category (
    CategoryID    INT         AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 3. ITEM
-- =====================
CREATE TABLE IF NOT EXISTS item (
    ItemID         INT           AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(100)  NOT NULL,
    description    TEXT,
    starting_price DECIMAL(10,2) NOT NULL,
    start_time     DATETIME      NOT NULL,
    end_time       DATETIME      NOT NULL,
    SellerID       INT           NOT NULL,
    CategoryID     INT           NOT NULL,
    WinnerID       INT           DEFAULT NULL,
    FOREIGN KEY (SellerID)   REFERENCES user(UserID)     ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES category(CategoryID) ON DELETE RESTRICT,
    FOREIGN KEY (WinnerID)   REFERENCES user(UserID)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 4. ITEM_IMAGE
-- =====================
CREATE TABLE IF NOT EXISTS item_image (
    ImageID   INT          AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    ItemID    INT          NOT NULL,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 5. BID
-- =====================
CREATE TABLE IF NOT EXISTS bid (
    BidID      INT           AUTO_INCREMENT PRIMARY KEY,
    UserID     INT           NOT NULL,
    ItemID     INT           NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_time   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES item(ItemID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 6. COMMENT
-- =====================
CREATE TABLE IF NOT EXISTS comment (
    CommentID    INT      AUTO_INCREMENT PRIMARY KEY,
    content      TEXT     NOT NULL,
    post_time    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    WriterID     INT      NOT NULL,
    BoardOwnerID INT      NOT NULL,
    FOREIGN KEY (WriterID)     REFERENCES user(UserID) ON DELETE CASCADE,
    FOREIGN KEY (BoardOwnerID) REFERENCES user(UserID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- 7. NOTIFICATION
-- =====================
CREATE TABLE IF NOT EXISTS notification (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    type       ENUM('outbid','comment','won') NOT NULL,
    message    VARCHAR(255) NOT NULL,
    item_id    INT          NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user   (user_id),
    INDEX idx_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- Seed Data
-- =====================
INSERT INTO category (category_name) VALUES
    ('Electronics'),
    ('Clothing'),
    ('Books'),
    ('Collectibles'),
    ('Home & Garden');
