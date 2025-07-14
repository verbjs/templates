import { Verb } from 'verb';
import { cors } from './cors';
import { logging } from './logging';
import { security } from './security';
import { validation } from './validation';
import { errorHandler } from './errorHandler';

export function setupMiddleware(app: Verb) {
  // Logging middleware (first)
  app.use(logging);
  
  // Security middleware
  app.use(security);
  
  // CORS middleware
  app.use(cors);
  
  // Request validation middleware
  app.use(validation);
  
  // Error handling middleware (last)
  app.use(errorHandler);
}