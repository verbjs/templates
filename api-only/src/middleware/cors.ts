import { Request, Response } from 'verb';
import { config } from '../config';

export function cors(req: Request, res: Response, next: () => void) {
  const origin = req.headers.origin;
  
  if (!origin || config.cors.origin.includes(origin) || config.cors.origin.includes('*')) {
    res.headers['Access-Control-Allow-Origin'] = origin || '*';
  }
  
  res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
  res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
  res.headers['Access-Control-Allow-Credentials'] = 'true';
  res.headers['Access-Control-Max-Age'] = '86400';
  
  if (req.method === 'OPTIONS') {
    res.status = 204;
    res.end();
    return;
  }
  
  next();
}