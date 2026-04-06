-- ============================================================
-- VINOVA Database Schema & Advanced Authorization — MS SQL Server
-- ============================================================

-- 1. SETUP DATABASE
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'VinovaDB')
BEGIN
    CREATE DATABASE VinovaDB;
END
GO

USE VinovaDB;
GO

-- 2. CREATE TABLES
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255) NOT NULL,
        phone NVARCHAR(20),
        role NVARCHAR(50) NOT NULL DEFAULT 'customer', -- customer | admin
        tier NVARCHAR(50) NOT NULL DEFAULT 'silver',   -- silver | gold | platinum
        points INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
BEGIN
    CREATE TABLE products (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(255) NOT NULL UNIQUE,
        region NVARCHAR(100) NOT NULL,
        subregion NVARCHAR(100),
        type NVARCHAR(50) NOT NULL, -- red | white | sparkling | whisky | rose
        grape NVARCHAR(100),
        abv FLOAT,
        volume NVARCHAR(50) NOT NULL DEFAULT '750ml',
        price BIGINT NOT NULL,
        old_price BIGINT,
        stock INT NOT NULL DEFAULT 0,
        score INT,
        rating FLOAT NOT NULL DEFAULT 0,
        reviews_count INT NOT NULL DEFAULT 0,
        vintage INT,
        badge NVARCHAR(100),
        img NVARCHAR(500),
        description NVARCHAR(MAX),
        tasting_notes NVARCHAR(MAX), -- JSON string
        food_pairing NVARCHAR(MAX),  -- JSON string
        tags NVARCHAR(MAX),          -- JSON string
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
BEGIN
    CREATE TABLE orders (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT FOREIGN KEY REFERENCES users(id),
        guest_email NVARCHAR(255),
        status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        total BIGINT NOT NULL DEFAULT 0,
        shipping_fee BIGINT NOT NULL DEFAULT 50000,
        tax BIGINT NOT NULL DEFAULT 0,
        gift_wrap BIT NOT NULL DEFAULT 0,
        points_earned INT NOT NULL DEFAULT 0,
        gift_message NVARCHAR(MAX),
        adult_signature BIT NOT NULL DEFAULT 1,
        payment_method NVARCHAR(50), -- vnpay | momo | stripe | cod
        shipping_method NVARCHAR(50) DEFAULT 'standard',
        address NVARCHAR(MAX), -- JSON: {name, phone, street, district, city}
        note NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_items')
BEGIN
    CREATE TABLE order_items (
        id INT PRIMARY KEY IDENTITY(1,1),
        order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
        product_id INT NOT NULL FOREIGN KEY REFERENCES products(id),
        product_name NVARCHAR(255) NOT NULL,
        product_img NVARCHAR(500),
        qty INT NOT NULL DEFAULT 1,
        price_at_purchase BIGINT NOT NULL,
        volume NVARCHAR(50)
    );
END
GO

-- 3. SAMPLE DATA
-- Users
INSERT INTO users (email, password, full_name, role, tier, points)
VALUES 
('admin@vinova.vn', '$2b$10$xyz...', 'Quản trị viên', 'admin', 'platinum', 5000),
('khachhang@gmail.com', '$2b$10$abc...', 'Nguyễn Văn Khách', 'customer', 'gold', 1200);

-- Products
INSERT INTO products (name, region, type, price, stock, rating, reviews_count, vintage, badge, img, description, tasting_notes, food_pairing, tags)
VALUES
('Château Margaux 2015', 'Pháp', 'red', 35000000, 10, 4.9, 124, 2015, 'Hạng nhất', 'images/red_wine_bottle.jpg', 'Một trong những chai rượu quý hiếm và đắt đỏ nhất thế giới.', '{"color":"Đỏ ruby sâu","nose":"Hoa hồng, dâu rừng, gỗ sồi","palate":"Mượt mà, tannin chắc chắn","finish":"Cực kỳ dài"}', '["Thịt bò Wagyu", "Phô mai già", "Thịt cừu nướng"]', '["france", "bordeaux", "premium"]'),
('Dom Pérignon Luminous', 'Pháp', 'sparkling', 8500000, 25, 4.8, 89, 2012, 'Iconic', 'images/sparkling_wine_bottle.jpg', 'Biểu tượng của sự sang trọng và đẳng cấp.', '{"color":"Vàng rơm sáng","nose":"Bánh mì nướng, trái cây trắng","palate":"Bọt mịn, tươi mát","finish":"Thanh lịch"}', '["Hàu tươi", "Sashimi", "Caviar"]', '["france", "champagne", "luxury"]'),
('Macallan 18 Year Old Shell', 'Scotland', 'whisky', 12500000, 15, 4.7, 56, 2023, 'Bestseller', 'images/whisky_bottle.jpg', 'Single Malt Scotch Whisky huyền thoại.', '{"color":"Hổ phách đậm","nose":"Gừng, trái cây khô, quế","palate":"Đầy đặn, vị sherry ngọt ngào","finish":"Khói nhẹ và gia vị"}', '["Socola đen", "Xì gà", "Thịt bò khô"]', '["scotland", "whisky", "single-malt"]'),
('Cloudy Bay Sauvignon Blanc', 'New Zealand', 'white', 1200000, 45, 4.6, 210, 2022, 'Cổ điển', 'images/white_wine_bottle.jpg', 'Dòng vang trắng nổi tiếng nhất từ Marlborough.', '{"color":"Vàng chanh nhạt","nose":"Chanh dây, bưởi, cỏ tươi","palate":"Sống động, khoáng chất","finish":"Tươi mát"}', '["Hải sản", "Salad", "Gà nướng"]', '["newzealand", "white", "sauvignon-blanc"]');
GO

-- 4. AUTHORIZATION (Logins, Users, Roles)
-- A. Database Roles
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_Admin' AND type = 'R')
BEGIN
    EXEC('CREATE ROLE [Role_Admin]');
END
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_Customer' AND type = 'R')
BEGIN
    EXEC('CREATE ROLE [Role_Customer]');
END
GO

-- B. Permissions
EXEC('GRANT SELECT, INSERT, UPDATE, DELETE TO [Role_Admin]');
EXEC('GRANT SELECT ON [dbo].[products] TO [Role_Customer]');
EXEC('GRANT SELECT, INSERT ON [dbo].[orders] TO [Role_Customer]');
EXEC('GRANT SELECT, UPDATE ([full_name], [phone]) ON [dbo].[users] TO [Role_Customer]');
GO

-- C. Demo Logins (Optional)
USE master;
GO
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'AdminLogin')
BEGIN
    CREATE LOGIN [AdminLogin] WITH PASSWORD = 'AdminPass!123', DEFAULT_DATABASE = [VinovaDB];
END
GO

USE VinovaDB;
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'AdminUser')
BEGIN
    CREATE USER [AdminUser] FOR LOGIN [AdminLogin];
    ALTER ROLE [Role_Admin] ADD MEMBER [AdminUser];
END
GO

PRINT '==================================================';
PRINT '  >>> SETUP HOÀN TẤT: SCHEMA + DATA + AUTH <<< ';
PRINT '==================================================';
