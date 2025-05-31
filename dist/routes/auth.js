"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    }
    catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({
            error: 'Kayıt işlemi başarısız oldu.',
            details: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Giriş denemesi:', { email });
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.log('Kullanıcı bulunamadı:', email);
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        console.log('Şifre kontrolü:', { isValidPassword });
        if (!isValidPassword) {
            console.log('Geçersiz şifre:', email);
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({
            error: 'Giriş işlemi başarısız oldu.',
            details: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
    }
});
exports.default = router;
