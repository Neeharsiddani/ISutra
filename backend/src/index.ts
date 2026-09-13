// ============================================================
// IS Standards AI — Express Server Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import standardsRoutes from './routes/standards';
import analysisRoutes from './routes/analysis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { isSupabaseConfigured } from './database/supabase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ISutra — AI-Powered Indian Standards Intelligence',
    phase: 'Phase 2 — AI Requirement Understanding',
    supabase: isSupabaseConfigured() ? 'configured' : 'not configured (in-memory & demo fallback)',
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use('/api/standards', standardsRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/analysis', analysisRoutes);

// --- Error Handling ---
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// --- Start Server ---
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
      isSupabaseConfigured() ? '✅ Configured' : '⚠️  Not configured (in-memory & demo data)'
    }`
  );
  console.log('═══════════════════════════════════════════');
  console.log('');
});

export default app;
