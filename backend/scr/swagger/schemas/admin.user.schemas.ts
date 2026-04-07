/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: Admin API quản lý người dùng
 *
 * components:
 *   schemas:
 *     AdminUpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyen Van B"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, BANNED]
 *           example: "ACTIVE"
 *
 *     AdminResetUserPasswordInput:
 *       type: object
 *       required:
 *         - newPassword
 *       properties:
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "Password@123"
 *
 *     AdminUpdateUserStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, BANNED]
 *           example: "BANNED"
 *
 * /admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, BANNED]
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền Admin
 *
 * /admin/users/{id}:
 *   get:
 *     summary: Lấy chi tiết người dùng theo id (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy chi tiết người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *
 *   put:
 *     summary: Cập nhật người dùng (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateUserInput'
 *     responses:
 *       200:
 *         description: Cập nhật người dùng thành công
 *       400:
 *         description: Validation error / Email đã tồn tại
 *       404:
 *         description: Không tìm thấy người dùng
 *
 *   delete:
 *     summary: Xóa mềm người dùng (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *
 * /admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset mật khẩu người dùng (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminResetUserPasswordInput'
 *     responses:
 *       200:
 *         description: Reset mật khẩu thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái người dùng (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateUserStatusInput'
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
