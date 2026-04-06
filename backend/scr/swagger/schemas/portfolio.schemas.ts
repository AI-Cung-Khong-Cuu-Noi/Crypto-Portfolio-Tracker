/**
 * @swagger
 * tags:
 *   name: Portfolios
 *   description: Portfolio management API
 *
 * components:
 *   schemas:
 *     CreatePortfolioInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Spot Portfolio"
 *         description:
 *           type: string
 *           example: "Danh mục giao dịch spot ngắn hạn"
 *
 *     UpdatePortfolioInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Long-term Portfolio"
 *         description:
 *           type: string
 *           example: "Danh mục đầu tư dài hạn"
 *
 * /portfolios:
 *   post:
 *     summary: Tạo portfolio mới
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePortfolioInput'
 *     responses:
 *       201:
 *         description: Tạo portfolio thành công
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Lấy danh sách portfolio của user hiện tại
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách portfolio
 *       401:
 *         description: Unauthorized
 *
 * /portfolios/{id}:
 *   get:
 *     summary: Lấy chi tiết portfolio theo id
 *     tags: [Portfolios]
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
 *         description: Chi tiết portfolio
 *       404:
 *         description: Không tìm thấy portfolio
 *
 *   put:
 *     summary: Cập nhật portfolio
 *     tags: [Portfolios]
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
 *             $ref: '#/components/schemas/UpdatePortfolioInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy portfolio
 *
 *   delete:
 *     summary: Xóa portfolio
 *     tags: [Portfolios]
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
 *         description: Không tìm thấy portfolio
 */
