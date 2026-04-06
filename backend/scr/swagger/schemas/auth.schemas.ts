/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 * 
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password@123"
 * 
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password@123"
 * 
 *     VerifyOtpInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 *         otp:
 *           type: string
 *           example: "123456"
 * 
 *     ResendOtpInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 * 
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 * 
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "sieuhao1047@gmail.com"
 *         otp:
 *           type: string
 *           example: "123456"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "Password@123"
 * 
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới (cấp mã OTP)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists / Validation error
 * 
 * /auth/login:
 *   post:
 *     summary: Đăng nhập bằng Email và Password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful (Returns JWT token)
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified / Banned
 * 
 * /auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP để kích hoạt tài khoản
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpInput'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP / Already verified
 *       404:
 *         description: User not found
 * 
 * /auth/resend-otp:
 *   post:
 *     summary: Gửi lại mã OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpInput'
 *     responses:
 *       200:
 *         description: New OTP sent
 *       400:
 *         description: User already active
 *       404:
 *         description: User not found
 * 
 * /auth/forgot-password:
 *   post:
 *     summary: Yêu cầu mã OTP qua email để khôi phục mật khẩu
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: OTP khôi phục gửi thành công
 *       404:
 *         description: Không tìm thấy người dùng
 * 
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu với OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: OTP không hợp lệ hoặc hết hạn
 *       404:
 *         description: Không tìm thấy người dùng
 */
