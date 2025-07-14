import { Verb } from 'verb';
import { z } from 'zod';
import { validateSchema } from '../middleware/validation';
import { UserRepository } from '../repositories/user';
import { authenticateToken, generateToken } from '../utils/auth';
import { logger } from '../utils/logger';

const userRepo = new UserRepository();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
});

export const usersRouter = new Verb();

// GET /api/users (protected)
usersRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await userRepo.findAll();
    res.json({ users });
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    res.status = 500;
    res.json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id (protected)
usersRouter.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status = 400;
      res.json({ error: 'Invalid user ID' });
      return;
    }
    
    const user = await userRepo.findById(userId);
    if (!user) {
      res.status = 404;
      res.json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    res.status = 500;
    res.json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users/register
usersRouter.post('/register', validateSchema(createUserSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      res.status = 409;
      res.json({ error: 'User already exists' });
      return;
    }
    
    const user = await userRepo.create({ email, password, name });
    const token = generateToken(user.id);
    
    res.status = 201;
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (error) {
    logger.error('Failed to register user:', error);
    res.status = 500;
    res.json({ error: 'Failed to register user' });
  }
});

// POST /api/users/login
usersRouter.post('/login', validateSchema(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await userRepo.findByEmail(email);
    if (!user || !await userRepo.verifyPassword(user.id, password)) {
      res.status = 401;
      res.json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = generateToken(user.id);
    
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (error) {
    logger.error('Failed to login user:', error);
    res.status = 500;
    res.json({ error: 'Failed to login' });
  }
});

// PUT /api/users/:id (protected)
usersRouter.put('/:id', authenticateToken, validateSchema(updateUserSchema), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status = 400;
      res.json({ error: 'Invalid user ID' });
      return;
    }
    
    // Check if user can update this profile
    if ((req as any).userId !== userId) {
      res.status = 403;
      res.json({ error: 'Cannot update other user profiles' });
      return;
    }
    
    const user = await userRepo.update(userId, req.body);
    if (!user) {
      res.status = 404;
      res.json({ error: 'User not found' });
      return;
    }
    
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    logger.error('Failed to update user:', error);
    res.status = 500;
    res.json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id (protected)
usersRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status = 400;
      res.json({ error: 'Invalid user ID' });
      return;
    }
    
    // Check if user can delete this profile
    if ((req as any).userId !== userId) {
      res.status = 403;
      res.json({ error: 'Cannot delete other user profiles' });
      return;
    }
    
    await userRepo.delete(userId);
    res.status = 204;
    res.end();
  } catch (error) {
    logger.error('Failed to delete user:', error);
    res.status = 500;
    res.json({ error: 'Failed to delete user' });
  }
});