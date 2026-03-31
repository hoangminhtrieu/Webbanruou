# 🍷 VINOVA Premium Wine & Spirits

Hệ thống quản lý và giới thiệu rượu vang cao cấp, tích hợp thanh toán và quản lý đơn hàng.

## 🚀 Tính năng chính
- **Cửa hàng sản phẩm**: Danh sách sản phẩm phong phú với bộ lọc theo loại, vùng miền, giá cả.
- **Chi tiết sản phẩm**: Thông tin chi tiết về hương vị (tasting notes), nồng độ, năm sản xuất (vintage).
- **Giỏ hàng & Thanh toán**: Hỗ trợ nhiều phương thức thanh toán (VNPay, MoMo, Stripe).
- **Quản trị viên**: Trang dashboard theo dõi doanh thu và quản lý kho hàng.
- **Đồng bộ dữ liệu**: Công cụ `sync_products.js` giúp đồng bộ dữ liệu giữa Frontend và Backend.

## 🛠️ Công nghệ sử dụng
- **Frontend**: Vanilla HTML5, CSS3, JavaScript.
- **Backend**: Node.js, Express.
- **Cơ sở dữ liệu**: SQLite (sử dụng thư viện `node:sqlite` tích hợp sẵn).
- **Thanh toán**: Cổng thanh toán VNPay, MoMo và Stripe API.

## 📦 Cài đặt & Chạy ứng dụng

### 1. Cài đặt Dependencies
```bash
# Tại thư mục gốc
npm install

# Di chuyển vào thư mục server
cd server
npm install
```

### 2. Cấu hình Môi trường
Sao chép tệp `.env.example` thành `.env` và điền các thông tin cần thiết:
```bash
cp server/.env.example server/.env
```

### 3. Đồng bộ & Seed Dữ liệu
```bash
# Đồng bộ sản phẩm từ Frontend sang Seed
node sync_products.js

# Chạy seed dữ liệu vào Database
cd server
node seeds/products.js
```

### 4. Chạy ứng dụng
```bash
# Tại thư mục server
npm run dev
```

## 📁 Cấu trúc thư mục
- `/server`: Mã nguồn backend (Express server).
- `/images`: Tài nguyên hình ảnh sản phẩm.
- `app.js`: Logic chính của ứng dụng frontend.
- `sync_products.js`: Tool đồng bộ dữ liệu.
- `index.html`: Giao diện chính của website.

## 👤 Thông tin Admin
- **Email**: `admin@vinova.vn`
- **Mật khẩu**: `Admin@123`

---
*Dự án được phát triển với sự hỗ trợ của Antigravity Agent.*
