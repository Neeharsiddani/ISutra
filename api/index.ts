// Vercel Serverless Function entry point
// Connects Vercel's serverless environment to the ISutra Express application
import backendApp from '../backend/src/index';

const app = (backendApp as any).default || backendApp;

export default app;

