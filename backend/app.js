import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import notFound from './middleware/notFoundMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();


// Security headers
app.use(helmet());

// CORS — restrict to the configured frontend origin only
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://quickbite-frontend-bt6m.onrender.com',
    credentials: true,
  })
);

// Body & cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging in development only
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiter — generous; auth routes get a stricter one later
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Health check — useful for Render/uptime monitoring later
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

// 404 + error handling — must be last, in this order
app.use(notFound);
app.use(errorHandler);

export default app;