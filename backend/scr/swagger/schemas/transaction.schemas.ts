/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Giao dịch (dùng để tính holdings)
 *
 * components:
 *   schemas:
 *     CreateTransactionInput:
 *       type: object
 *       required:
 *         - portfolioId
 *         - type
 *         - symbol
 *         - amount
 *         - date
 *       properties:
 *         portfolioId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [BUY, SELL, TRANSFER]
 *         transferDirection:
 *           type: string
 *           enum: [IN, OUT]
 *           description: Bắt buộc khi type là TRANSFER
 *         symbol:
 *           type: string
 *           example: "BTC"
 *         coinGeckoId:
 *           type: string
 *           example: "bitcoin"
 *         amount:
 *           type: number
 *           example: 0.5
 *         price:
 *           type: number
 *           description: Giá USD mỗi đơn vị (BUY cần price hoặc totalValue)
 *         fee:
 *           type: number
 *         totalValue:
 *           type: number
 *         exchange:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *
 *     UpdateTransactionInput:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [BUY, SELL, TRANSFER]
 *         transferDirection:
 *           type: string
 *           enum: [IN, OUT]
 *         symbol:
 *           type: string
 *         coinGeckoId:
 *           type: string
 *         amount:
 *           type: number
 *         price:
 *           type: number
 *         fee:
 *           type: number
 *         totalValue:
 *           type: number
 *         exchange:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *
 * /transactions:
 *   post:
 *     summary: Tạo giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Validation error
 *       404:
 *         description: Không tìm thấy portfolio
 *
 *   get:
 *     summary: Danh sách giao dịch (lọc theo portfolioId, phân trang)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolioId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách giao dịch
 *
 * /transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
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
 *             $ref: '#/components/schemas/UpdateTransactionInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 *
 *   delete:
 *     summary: Xóa giao dịch
 *     tags: [Transactions]
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
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 */
