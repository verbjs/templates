import { Pool } from 'pg';
import { getPool } from '../db/connection';

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
}

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(): Promise<Omit<User, 'password_hash'>[]> {
    const result = await this.pool.query(
      'SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
    const result = await this.pool.query(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(data: CreateUserData): Promise<Omit<User, 'password_hash'>> {
    const passwordHash = await Bun.password.hash(data.password);
    
    const result = await this.pool.query(
      `INSERT INTO users (email, name, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id, email, name, created_at, updated_at`,
      [data.email, data.name, passwordHash]
    );
    
    return result.rows[0];
  }

  async update(id: number, data: UpdateUserData): Promise<Omit<User, 'password_hash'> | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, name, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async verifyPassword(id: number, password: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [id]
    );
    
    if (!result.rows[0]) {
      return false;
    }
    
    return await Bun.password.verify(password, result.rows[0].password_hash);
  }

  async initializeTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }
}