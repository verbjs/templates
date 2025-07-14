import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/user';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

class AuthService {
  private blacklistedTokens = new Set<string>();
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, config.bcrypt.rounds);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: 'user',
    });

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      // Constant-time response to prevent email enumeration
      await bcrypt.compare(data.password, '$2b$12$dummy.hash.to.prevent.timing.attacks');
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const tokenData = this.refreshTokens.get(refreshToken);
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      this.refreshTokens.delete(refreshToken);
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Get user
    const user = await userRepository.findById(tokenData.userId);
    if (!user) {
      this.refreshTokens.delete(refreshToken);
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Remove old refresh token
    this.refreshTokens.delete(refreshToken);

    // Generate new tokens
    const tokens = this.generateTokens(user);

    return tokens;
  }

  async logout(token: string): Promise<void> {
    // Add token to blacklist
    this.blacklistedTokens.add(token);

    // Clean up old blacklisted tokens periodically
    if (this.blacklistedTokens.size > 10000) {
      this.cleanupBlacklist();
    }
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  private generateTokens(user: any): { token: string; refreshToken: string } {
    // Generate access token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'verb-api',
        subject: user.id,
      }
    );

    // Generate refresh token
    const refreshToken = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt,
    });

    return { token, refreshToken };
  }

  private cleanupBlacklist() {
    // In production, you'd want to use Redis or database for this
    // For now, just clear half of the blacklist
    const tokens = Array.from(this.blacklistedTokens);
    this.blacklistedTokens.clear();
    
    // Keep the most recent half
    tokens.slice(tokens.length / 2).forEach(token => {
      this.blacklistedTokens.add(token);
    });

    logger.info('Cleaned up token blacklist', { 
      removedTokens: tokens.length / 2,
      remainingTokens: this.blacklistedTokens.size 
    });
  }

  // Cleanup expired refresh tokens periodically
  private cleanupRefreshTokens() {
    const now = Date.now();
    let removedCount = 0;

    for (const [token, data] of this.refreshTokens.entries()) {
      if (now > data.expiresAt) {
        this.refreshTokens.delete(token);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Cleaned up expired refresh tokens', { 
        removedCount,
        remainingCount: this.refreshTokens.size 
      });
    }
  }

  constructor() {
    // Cleanup expired refresh tokens every hour
    setInterval(() => this.cleanupRefreshTokens(), 60 * 60 * 1000);
  }
}

export const authService = new AuthService();