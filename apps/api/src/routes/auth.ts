import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { loginSchema, registerSchema } from '@lp/shared';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body as { email: string; password: string; name: string };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'Email already in use');

    const hashed = await bcrypt.hash(password, 12);

    // First registered user becomes admin
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'MARKETER';

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role as 'ADMIN' | 'MARKETER' },
      select: { id: true, email: true, name: true, role: true, brandId: true, createdAt: true },
    });

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser, token });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) throw new AppError(401, 'Not authenticated');

    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, brandId: true, createdAt: true },
    });
    if (!user) throw new AppError(401, 'User not found');
    res.json(user);
  })
);

export default router;
