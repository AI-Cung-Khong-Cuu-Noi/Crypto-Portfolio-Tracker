/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile API
 * 
 * components:
 *   schemas:
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           format: url
 *           example: "https://example.com/avatar.png"
 * 
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           example: "Password@123"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "Password@321"
 * 
 * /users/me:
 *   get:
 *     summary: Lấy thông tin profile cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized / Token invalid
 *         
 *   put:
 *     summary: Cập nhật thông tin profile cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 * 
 * /users/password:
 *   put:
 *     summary: Thay đổi mật khẩu người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không chính xác hoặc lỗi validation
 *       401:
 *         description: Chưa xác thực (Unauthorized)
 */
