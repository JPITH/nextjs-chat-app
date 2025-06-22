// src/lib/auth.ts
import bcrypt from 'bcryptjs';
import { redis } from './redis';
import { User } from '@/types/auth';
import { generateId } from './utils';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  // Check if user already exists
  const existingUser = await redis.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const userId = generateId();
  const hashedPassword = await hashPassword(password);
  
  const user: User = {
    id: userId,
    email,
    name,
    createdAt: new Date(),
  };

  // Save user data
  await redis.saveUser(user);
  await redis.saveUserByEmail(email, userId);
  await redis.saveUserPassword(userId, hashedPassword);

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await redis.getUserByEmail(email);
  if (!user) return null;

  const hashedPassword = await redis.getUserPassword(user.id);
  if (!hashedPassword) return null;

  const isValid = await verifyPassword(password, hashedPassword);
  if (!isValid) return null;

  return user;
}