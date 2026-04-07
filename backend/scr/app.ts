import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routers/auth.router';
import userRoutes from './routers/user.router';
import portfolioRoutes from './routers/portfolio.router';
import transactionRoutes from './routers/transaction.router';
import dashboardRoutes from './routers/dashboard.router';
import watchlistRoutes from './routers/watchlist.router';
import alertRoutes from './routers/alert.router';
import notificationRoutes from './routers/notification.router';
import reportsRoutes from './routers/reports.router';
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
    res.status(200).json({ status: 'ok', message: 'Crypto Portfolio Tracker API is running' });
});

// TODO: Import and use routers
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/portfolios', portfolioRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/alerts', alertRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportsRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
