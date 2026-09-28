// ============================================================
// ISutra — Centralized MongoDB Connection Module
// SIH26108 Database Layer Migration
// Manages safe Mongoose connection, status checking, and graceful shutdown
// NEVER logs raw credentials or connection strings with passwords
// ============================================================

import mongoose from 'mongoose';

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  readyState: number;
  stateLabel: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  host?: string;
  databaseName?: string;
  isConfigured: boolean;
}

let isConnecting = false;

/**
 * Sanitizes a MongoDB URI string to mask credentials in logs
 */
export function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  } catch {
    return 'mongodb://***';
  }
}

/**
 * Checks whether MONGODB_URI environment variable is configured
 */
export function isMongoConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}

/**
 * Establishes connection to MongoDB safely via Mongoose.
 * If MONGODB_URI is not set or fails, reports failure clearly without crashing the server.
 */
export async function connectToDatabase(customUri?: string): Promise<boolean> {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️  MONGODB_URI not configured. Operating with local verified reference fallback.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;
  const sanitized = sanitizeMongoUri(uri);

  try {
    console.log(`🔄 Connecting to MongoDB at ${sanitized}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log('✅ Connected to MongoDB successfully.');
    isConnecting = false;
    return true;
  } catch (error: any) {
    isConnecting = false;
    console.warn(`⚠️  Failed to connect to MongoDB (${sanitized}):`, error?.message || 'Connection error');
    return false;
  }
}

/**
 * Closes the MongoDB connection cleanly
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB.');
    } catch (err: any) {
      console.warn('⚠️  Error disconnecting from MongoDB:', err?.message);
    }
  }
}

/**
 * Returns current database connection status
 */
export function getDatabaseStatus(): DatabaseConnectionStatus {
  const state = mongoose.connection.readyState;
  const labels: Record<number, DatabaseConnectionStatus['stateLabel']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    isConnected: state === 1,
    readyState: state,
    stateLabel: labels[state] || 'uninitialized',
    host: state === 1 ? mongoose.connection.host : undefined,
    databaseName: state === 1 ? mongoose.connection.name : undefined,
    isConfigured: isMongoConfigured(),
  };
}
