/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tổng quan & phân tích danh mục
 *
 * /dashboard/summary:
 *   get:
 *     summary: Tổng giá trị, P&L (realized + unrealized), top gainers/losers trong holdings
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *         description: Lọc theo một portfolio (bỏ trống = toàn bộ tài khoản)
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy portfolio
 *
 * /dashboard/allocation:
 *   get:
 *     summary: Phân bổ tài sản (pie chart) theo giá trị thị trường
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy portfolio
 *
 * /dashboard/performance:
 *   get:
 *     summary: Chuỗi giá trị theo ngày (ước tính bằng giá spot hiện tại)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy portfolio
 *
 * /dashboard/trend:
 *   get:
 *     summary: Top tăng/giảm mạnh 24h trên thị trường (Binance Spot)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 */
