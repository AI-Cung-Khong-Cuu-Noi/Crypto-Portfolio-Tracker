/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Báo cáo & thống kê (theo kỳ, thuế / realized P&L, theo coin)
 *
 * /reports/summary:
 *   get:
 *     summary: Báo cáo tổng hợp theo ngày / tháng / năm
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, month, year]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Các bucket theo kỳ + tổng
 *       404:
 *         description: Không tìm thấy portfolio
 *
 * /reports/tax-realized:
 *   get:
 *     summary: Báo cáo realized P&L (từng lệnh bán) — hỗ trợ báo cáo thuế
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Danh sách dòng realized + tổng
 *       404:
 *         description: Không tìm thấy portfolio
 *
 * /reports/by-coin:
 *   get:
 *     summary: Thống kê / hiệu suất theo từng coin
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: includeMarket
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Mảng thống kê theo symbol
 *       404:
 *         description: Không tìm thấy portfolio
 */
