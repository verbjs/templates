import { Request, Response } from 'verb';
import { z } from 'zod';

export function validation(req: Request, res: Response, next: () => void) {
  // Content-Type validation for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status = 415;
      res.json({ error: 'Content-Type must be application/json' });
      return;
    }
  }
  
  next();
}

// Helper to create validation middleware for specific schemas
export function validateSchema<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: () => void) => {
    try {
      const data = source === 'body' ? req.body : 
                  source === 'query' ? req.query : 
                  req.params;
      
      const result = schema.parse(data);
      (req as any)[source] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status = 400;
        res.json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        res.status = 400;
        res.json({ error: 'Invalid request data' });
      }
    }
  };
}