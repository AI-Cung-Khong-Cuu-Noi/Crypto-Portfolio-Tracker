/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Cảnh báo giá / % thay đổi 24h (cron + email + thông báo in-app)
 *
 * components:
 *   schemas:
 *     CreateAlertInput:
 *       type: object
 *       required:
 *         - symbol
 *         - kind
 *         - threshold
 *       properties:
 *         symbol:
 *           type: string
 *           example: "ETH"
 *         coinGeckoId:
 *           type: string
 *         kind:
 *           type: string
 *           enum: [PRICE_ABOVE, PRICE_BELOW, CHANGE_24H_ABOVE, CHANGE_24H_BELOW]
 *         threshold:
 *           type: number
 *           description: USD cho PRICE_*; phần trăm dương cho CHANGE_24H_*
 *         isActive:
 *           type: boolean
 *         cooldownMinutes:
 *           type: integer
 *           description: Khoảng cách tối thiểu giữa hai lần kích hoạt (1–10080 phút)
 *
 * /alerts:
 *   post:
 *     summary: Tạo cảnh báo
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertInput'
 *     responses:
 *       201:
 *         description: Đã tạo
 *
 *   get:
 *     summary: Danh sách cảnh báo của user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /alerts/{id}:
 *   patch:
 *     summary: Cập nhật cảnh báo
 *     tags: [Alerts]
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
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 *
 *   delete:
 *     summary: Xóa cảnh báo
 *     tags: [Alerts]
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
 *         description: Đã xóa
 */
