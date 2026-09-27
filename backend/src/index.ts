// ============================================================
// IS Standards AI — Express Server Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import standardsRoutes from './routes/standards';
import analysisRoutes from './routes/analysis';
import recommendationsRoutes from './routes/recommendations';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { isSupabaseConfigured } from './database/supabase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, serverless proxies)
      if (!origin) return callback(null, true);
      if (
        corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for API access
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
// --- Body Parsing (Serverless Safe: Avoid re-reading already consumed streams) ---
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  return express.json({ limit: '10mb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  return express.urlencoded({ extended: true })(req, res, next);
});

// --- API Root Info ---
const apiRootHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'ISutra — AI-Powered Indian Standards Intelligence API',
    version: '1.0.0',
    documentation: 'https://github.com/Neeharsiddani/ISutra',
    endpoints: {
      health: '/api/health',
      standards: '/api/standards',
      analysis: '/api/analysis',
      recommendations: '/api/recommendations',
    },
    timestamp: new Date().toISOString(),
  });
};
app.get('/api', apiRootHandler);
app.get('/', apiRootHandler);

// --- Health Check ---
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'ISutra — AI-Powered Indian Standards Intelligence',
    phase: 'Phase 4 — Intelligent BIS Standards Matching Engine',
    supabase: isSupabaseConfigured() ? 'configured' : 'not configured (in-memory & demo fallback)',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// --- API Routes (mounted with and without /api prefix for serverless compatibility) ---
app.use('/api/standards', standardsRoutes);
app.use('/standards', standardsRoutes);

app.use('/api/analyze', analysisRoutes);
app.use('/analyze', analysisRoutes);

app.use('/api/analysis', analysisRoutes);
app.use('/analysis', analysisRoutes);

app.use('/api/recommendations', recommendationsRoutes);
app.use('/recommendations', recommendationsRoutes);

// --- Error Handling ---
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// --- Start Server (only when not running in serverless environment like Vercel) ---
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ISutra — Backend API');
    console.log('  Phase 2 — AI Requirement Understanding');
    console.log('═══════════════════════════════════════════');
    console.log(`  🚀 Server running on port ${PORT}`);
    console.log(`  📡 API: http://localhost:${PORT}/api`);
    console.log(
      `  💾 Supabase: ${
        isSupabaseConfigured()
          ? '✅ Configured'
          : '⚠️  Not configured (in-memory & demo data)'
      }`
    );
    console.log('═══════════════════════════════════════════');
    console.log('');
  });
}

export default app;
