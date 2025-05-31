import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password }: RegisterInput = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      error: 'Kayıt işlemi başarısız oldu.',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginInput = req.body;
    console.log('Giriş denemesi:', { email });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Şifre kontrolü:', { isValidPassword });

    if (!isValidPassword) {
      console.log('Geçersiz şifre:', email);
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      error: 'Giriş işlemi başarısız oldu.',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router; 