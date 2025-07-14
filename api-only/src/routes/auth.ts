import { Verb } from 'verb';
import { z } from 'zod';
import { validateSchema } from '../middleware/validation';
import { UserRepository } from '../repositories/user';
import { generateToken } from '../utils/auth';
import { logger } from '../utils/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const userRepo = new UserRepository();

export const authRouter = new Verb();

// Register
authRouter.post('/register', validateSchema(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    logger.info('User registration attempt', { email });

    // Check if user already exists
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      res.status = 409;
      res.json({ error: 'User already exists' });
      return;
    }

    const user = await userRepo.create({ email, password, name });
    const token = generateToken(user.id);

    logger.info('User registered successfully', { 
      userId: user.id, 
      email: user.email 
    });

    res.status = 201;
    res.json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    logger.error('Registration failed:', error);
    res.status = 500;
    res.json({ error: 'Registration failed' });
  }
});

// Login
authRouter.post('/login', validateSchema(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('User login attempt', { email });

    const user = await userRepo.findByEmail(email);
    if (!user || !await userRepo.verifyPassword(user.id, password)) {
      res.status = 401;
      res.json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    logger.error('Login failed:', error);
    res.status = 500;
    res.json({ error: 'Login failed' });
  }
});