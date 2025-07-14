console.log('Testing basic TypeScript execution...');

import { config } from './src/config';
console.log('Config loaded:', config.port);

import { logger } from './src/utils/logger';
logger.info('Logger working');

console.log('All imports successful!');