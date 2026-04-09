/**
 * @swagger
 * tags:
 *   name: Holdings
 *   description: Holdings computed from transactions + Binance Spot market prices
 *
 * /portfolios/{id}/holdings:
 *   get:
 *     summary: Danh sách holdings của portfolio (số dư + giá + P&L chưa thực hiện)
 *     tags: [Holdings]
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
 *         description: Holdings và tổng hợp giá trị
 *       404:
 *         description: Không tìm thấy portfolio
 */
