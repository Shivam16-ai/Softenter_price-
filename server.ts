import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import passport from './backend/config/passport.js';
import apiRouter from './backend/routes/index';
import { requestLogger, errorHandler } from './backend/middleware/errorMiddleware';
import { db } from './backend/database/connection';
import { logger } from './backend/utils/logger';
import { config } from './backend/config';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Initialize DB connection
  db.connect();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Session middleware (required for Passport)
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }) as any);

  // Initialize Passport
  app.use(passport.initialize() as any);
  app.use(passport.session() as any);

  app.use(requestLogger);

  // Serve static uploads if any
  app.use('/uploads', express.static(path.join(process.cwd(), 'backend/uploads')));

  // API routes mounted FIRST
  app.use('/api', apiRouter);

  // Error handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for client-side routing & dev
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { port: 24679 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`SwiftRoute Enterprise Parcel server running on port ${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Kill the process holding it and retry.`);
      logger.error(`Run: npx kill-port ${PORT}`);
    } else {
      logger.error(`Server error: ${err.message}`);
    }
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
