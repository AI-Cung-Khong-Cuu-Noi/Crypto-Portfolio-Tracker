/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Thông báo in-app (khi cảnh báo kích hoạt)
 *
 * /notifications:
 *   get:
 *     summary: Danh sách thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /notifications/read-all:
 *   post:
 *     summary: Đánh dấu tất cả đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /notifications/{id}/read:
 *   patch:
 *     summary: Đánh dấu một thông báo đã đọc
 *     tags: [Notifications]
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
 */
