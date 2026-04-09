# Crypto Portfolio Tracker

Crypto Portfolio Tracker là ứng dụng web giúp người dùng theo dõi, quản lý và phân tích danh mục tiền điện tử theo thời gian thực. Thay vì kiểm tra thủ công ở nhiều sàn, ứng dụng gom dữ liệu vào một dashboard duy nhất để theo dõi hiệu suất đầu tư, lãi/lỗ và các biến động quan trọng.

## 🚀 Chức năng chính

- Đăng ký/đăng nhập, xác thực OTP email, quên mật khẩu/đặt lại mật khẩu.
- Quản lý danh mục đầu tư (Portfolio).
- Quản lý giao dịch mua/bán/chuyển và tự động tính toán vị thế.
- Dashboard tổng quan: tổng giá trị, phân bổ tài sản, top tăng/giảm, P&L.
- Dữ liệu giá realtime qua WebSocket (Socket.IO).
- Watchlist theo dõi coin theo thời gian thực.
- Cảnh báo giá / biến động và nhận thông báo.
- Báo cáo theo kỳ, xuất CSV.
- API có tài liệu Swagger.

## 📁 Cấu trúc thư mục

- `frontend/`: mã nguồn giao diện người dùng.
- `backend/`: mã nguồn API, realtime socket, nghiệp vụ và database.
- `README.md`: tài liệu hướng dẫn dự án.
- `.gitignore`: danh sách file/thư mục không đưa lên Git.

## 👥 Danh sách thành viên

- 1721030545 - NguyenHoangTuanAnh
- 1721030403 - Lê Khả Hiếu
- 1721001777 - Đặng Nguyễn Thiên Ân
- 1721030439 - Trần Thanh Bình

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- React Query (`@tanstack/react-query`)
- React Hook Form + Zod
- Axios
- Socket.IO Client
- Recharts

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Node Cron
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### 1) Cài đặt Backend

```bash
cd backend
npm install
```

#### Cấu hình `.env` cho Backend

Tạo file `.env` trong thư mục `backend`:

```env
# Server
PORT=5000

# MongoDB
MONGODB_URI=<your_mongodb_connection_string>

# JWT
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=1d

# Email OTP (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password_here
```

#### Hướng dẫn tạo App Password Gmail (để gửi OTP)

1. Vào Google Account > `Security`.
2. Bật `2-Step Verification`.
3. Vào `App Passwords`, tạo mật khẩu ứng dụng mới.
4. Dùng mật khẩu 16 ký tự đó cho biến `EMAIL_PASS`.

#### Chạy Backend

```bash
npm run dev
```

Build:

```bash
npm run build
```

### 2) Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend` (hoặc dùng `.env.example`):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Chạy Frontend:

```bash
npm run dev
```

Build:

```bash
npm run build
```

### 3) Chạy đồng thời Backend + Frontend

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```
