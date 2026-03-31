-- ============================================================
-- VINOVA Database Schema & ADVANCED Authorization — SQL Server (T-SQL)
-- ============================================================

-- Dùng lệnh EXEC cho các lệnh CREATE ROLE/LOGIN để tránh hiện "Gạch đỏ" trong SSMS

-- 1. CHỌN DATABASE ĐÚNG
USE VinovaDB;
GO

-- 2. PHÂN QUYỀN (AUTHORIZATION) - Dùng lệnh EXEC để tránh báo lỗi IntelliSense

-- A. Tạo các Database Role (Nhóm quyền)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_Admin' AND type = 'R')
BEGIN
    EXEC('CREATE ROLE [Role_Admin]');
END
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_Customer' AND type = 'R')
BEGIN
    EXEC('CREATE ROLE [Role_Customer]');
END
GO

-- B. Gán quyền cho Role_Admin: Toàn quyền (Full CRUD)
EXEC('GRANT SELECT, INSERT, UPDATE, DELETE TO [Role_Admin]');

-- C. Gán quyền cho Role_Customer: Quyền hạn chế
EXEC('GRANT SELECT ON [dbo].[products] TO [Role_Customer]');
EXEC('GRANT SELECT, INSERT ON [dbo].[orders] TO [Role_Customer]');
EXEC('GRANT SELECT, UPDATE ([full_name], [phone]) ON [dbo].[users] TO [Role_Customer]');
GO

-- 3. KIẾM TRÁ LOGIN TỔNG QUÁT (Optional demo)

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
PRINT '  >>> KẾT QUẢ: PHÂN QUYỀN ĐÃ THIẾT LẬP XONG! <<< ';
PRINT '   - Role_Admin: Đầy đủ các quyền.';
PRINT '   - Role_Customer: Chỉ được xem hàng và mua hàng.';
PRINT '==================================================';
PRINT 'Lưu ý: Nếu SSMS hiện "gạch đỏ", bạn hãy nhấn F5 để chạy.';
PRINT 'Query executed successfully trong màn hình của bạn có nghĩa là ĐÃ THÀNH CÔNG!';
