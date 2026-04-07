/**
 * @swagger
 * tags:
 *   name: Watchlist
 *   description: Danh sách theo dõi coin
 *
 * /watchlist:
 *   post:
 *     summary: Thêm coin vào watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "BTC"
 *               coinGeckoId:
 *                 type: string
 *                 example: "bitcoin"
 *     responses:
 *       201:
 *         description: Đã thêm
 *       409:
 *         description: Trùng symbol
 *
 *   get:
 *     summary: Danh sách watchlist (kèm giá & %24h)
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /watchlist/{id}:
 *   delete:
 *     summary: Xóa khỏi watchlist
 *     tags: [Watchlist]
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
 *       404:
 *         description: Không tìm thấy
 */
