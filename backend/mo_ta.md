1. Tổng quan
1.1 Mục tiêu
Crypto Portfolio Tracker là ứng dụng web giúp người dùng cá nhân quản lý toàn bộ danh mục đầu tư tiền điện tử tại một nơi. Ứng dụng cho phép tổng hợp dữ liệu từ nhiều nguồn, theo dõi giá thời gian thực, tính toán lợi nhuận/thua lỗ (P&L) chính xác và cung cấp cái nhìn tổng quan về hiệu suất đầu tư.
Hệ thống cung cấp các tính năng chính:

Dashboard trực quan thời gian thực
Quản lý nhiều danh mục đầu tư (Portfolio)
Ghi nhận và quản lý giao dịch (Buy/Sell/Transfer)
Theo dõi giá crypto thời gian thực
Tính toán P&L (Unrealized & Realized)
Biểu đồ phân tích hiệu suất
Watchlist và cảnh báo giá
Báo cáo chi tiết
Quản trị hệ thống (Admin Panel)

1.2 Phạm vi
Tính năng chính:

Quản lý tài khoản & xác thực
Quản lý Portfolio
Quản lý giao dịch và Holdings
Dashboard & Phân tích
Watchlist & Cảnh báo giá
Báo cáo & Thống kê
Admin Panel: Quản lý người dùng và Quản lý coin

Công nghệ dự kiến:

Frontend: React + TypeScript + Tailwind CSS + TanStack Query + Recharts
Backend: Node.js + Express + TypeScript + Zod
Database: MongoDB (Mongoose)
Real-time: Socket.io hoặc Server-Sent Events
External API: CoinGecko (giá), Binance (tùy chọn)

Đối tượng sử dụng:

User: Nhà đầu tư cá nhân
Admin: Quản trị viên hệ thống

1.3 Vai trò người dùng

User: Quản lý portfolio, ghi nhận giao dịch, theo dõi giá, phân tích hiệu suất đầu tư của bản thân.
Admin: Quản trị toàn hệ thống, bao gồm quản lý người dùng, quản lý danh sách coin/token, giám sát hoạt động và hỗ trợ kỹ thuật.

2. Yêu cầu chức năng
2.1 Quản lý tài khoản và Xác thực
Mô tả: Hỗ trợ đăng ký, đăng nhập, xác thực OTP, quản lý profile và 2FA.
Frontend:

Trang đăng ký (email, password, full name)
Trang đăng nhập (email + password)
Xác thực OTP (đăng ký / reset password)
Trang Profile (avatar, thông tin cá nhân, settings, 2FA)

Backend API:

POST /auth/register
POST /auth/login
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/forgot-password
GET /users/me
PUT /users/me

Database:

users: _id, email, password (hashed), name, avatar, role (user/admin), status (active/inactive/suspended), lastLoginAt, createdAt, updatedAt
otpTokens: _id, userId, otp, purpose, expiresAt, used

2.2 Quản lý Portfolio
Mô tả: Người dùng có thể tạo và quản lý nhiều portfolio (Spot, Futures, Long-term, v.v.).
Frontend:

Danh sách portfolio
Tạo / Sửa / Xóa portfolio
Xem tổng giá trị, P&L tổng, tỷ lệ phân bổ

Backend API:

POST /portfolios
GET /portfolios
GET /portfolios/:id
PUT /portfolios/:id
DELETE /portfolios/:id

Database:

portfolios: _id, userId, name, description, createdAt, updatedAt

2.3 Quản lý Holdings (Tài sản nắm giữ)
Mô tả: Tự động tính toán holdings dựa trên giao dịch và lấy giá realtime.
Frontend: Danh sách holdings với current price, 24h change, value, unrealized P&L.
Backend: Tính toán động từ transactions + gọi API CoinGecko.
2.4 Quản lý Giao dịch (Transactions)
Mô tả: Ghi nhận tất cả hoạt động mua, bán, chuyển coin.
Frontend:

Form thêm giao dịch (Type, Coin, Amount, Price, Fee, Date, Exchange, Note)
Danh sách giao dịch (filter, pagination)
Import từ CSV/Excel (Giai đoạn 3)

Backend API:

POST /transactions
GET /transactions (filter & pagination)
PUT /transactions/:id
DELETE /transactions/:id

Database:

transactions: _id, userId, portfolioId, type (Buy/Sell/Transfer), symbol, amount, price, fee, totalValue, exchange, date, note, createdAt

2.5 Dashboard & Phân tích
Frontend:

Tổng giá trị portfolio, tổng P&L (Realized + Unrealized)
Pie chart: Asset Allocation
Line chart: Performance theo thời gian
Top gainers/losers, 24h change

Backend API:

GET /dashboard/summary
GET /dashboard/performance
GET /dashboard/allocation
GET /dashboard/trend

2.6 Watchlist & Cảnh báo
Frontend: Thêm/Xóa coin vào watchlist, thiết lập alert (giá hoặc % thay đổi).
Backend: Cron job hoặc WebSocket kiểm tra giá + gửi thông báo (in-app + email).
2.7 Báo cáo & Thống kê

Báo cáo theo ngày/tháng/năm
Tax report (Realized P&L)
Performance theo coin
Export PDF/Excel (Giai đoạn 3)

2.8 Admin Panel (Quản trị hệ thống) — Tính năng mới
Mô tả: Giao diện quản trị riêng cho Admin với quyền cao hơn. Admin không được chỉnh sửa trực tiếp portfolio/giao dịch của user (trừ trường hợp hỗ trợ đặc biệt).
Frontend (Admin Dashboard):

Layout riêng với sidebar: Overview, Users, Coins, Reports, System Logs
Bảng dữ liệu hỗ trợ tìm kiếm, filter, sort, pagination (TanStack Table)
Dark mode, responsive

2.8.1 Quản lý Người dùng

Xem danh sách tất cả users (filter: email, name, role, status)
Xem chi tiết user (profile + tổng hợp portfolio, transactions)
Chỉnh sửa thông tin (name, email, status)
Reset password user
Thay đổi role / Khóa/Mở khóa tài khoản
Xóa user (soft delete)
Export danh sách user

Backend API (protected by admin role):

GET /admin/users
GET /admin/users/:id
PUT /admin/users/:id
POST /admin/users/:id/reset-password
PATCH /admin/users/:id/status
DELETE /admin/users/:id

2.8.2 Quản lý Coin

Quản lý danh sách coin được hỗ trợ trong hệ thống
Thêm/Sửa/Xóa coin (symbol, name, logo, coingeckoId, category, isActive)
Xem thống kê coin (số user hold, volume giao dịch)
Trigger đồng bộ giá thủ công từ CoinGecko

Backend API:

GET /admin/coins
POST /admin/coins
GET /admin/coins/:id
PUT /admin/coins/:id
DELETE /admin/coins/:id
GET /admin/coins/stats
POST /admin/coins/sync

Database mới:

coins: _id, symbol (unique), name, coingeckoId, logoUrl, category, isActive, metadata, createdAt, updatedAt

2.8.3 Tính năng Admin bổ sung

Admin Overview Dashboard (tổng users, tổng portfolios, trading volume…)
Audit Log (ghi lại mọi hành động của Admin)

3. Yêu cầu phi chức năng
3.1 Hiệu suất

Giá crypto cập nhật mỗi 10–30 giây (ưu tiên WebSocket)
Pagination cho danh sách lớn
Index MongoDB cho các trường thường query (userId, symbol, date, role, isActive)

3.2 Bảo mật

JWT Authentication + Refresh Token
Role-Based Access Control (RBAC) – middleware kiểm tra role cho /admin/*
bcrypt password hashing + 2FA bắt buộc cho Admin
Rate limiting, Input validation (Zod), HTTPS
Audit log cho mọi hành động Admin

3.3 Khả năng mở rộng

Dễ tích hợp thêm sàn giao dịch
Hỗ trợ mobile app sau này
Multi-portfolio nâng cao

3.4 Giao diện

Responsive (Mobile first)
Dark mode
UI trực quan với nhiều biểu đồ (Recharts)

4. Ưu tiên triển khai (Phased Approach)
Giai đoạn 1 (Cơ bản):
Auth + Portfolio + Transactions + Holdings + Basic Dashboard
Giai đoạn 2 (Nâng cao):
Real-time price + Watchlist & Alerts + Admin Panel cơ bản (User Management + Coin Management) + RBAC
Giai đoạn 3 (Bổ sung):
Import/Export + Tax report + Notification system + Advanced Admin features (logs, reports, stats)
5. Lưu ý kỹ thuật

Authorization: Middleware riêng cho Admin routes
Validation: Zod cho tất cả API
Real-time: Socket.io
Cron job: node-cron cho alert và đồng bộ dữ liệu
Security: Không cho Admin xem password hash, ghi audit log đầy đủ

6. Phụ lục: Database Schema chính

users
portfolios
transactions
watchlists
alerts
otpTokens
coins (mới)
adminLogs (tùy chọn: adminId, action, entityType, entityId, details, timestamp)