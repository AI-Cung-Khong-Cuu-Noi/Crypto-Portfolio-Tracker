import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import { apiRouter } from './routers';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import cors from 'cors';

const app: Express = express();

app.use(cors());

// Middleware: Parse JSON & URL-encoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Crypto Portfolio Tracker backend is running' });
});

// API routers
app.use('/api', apiRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;

