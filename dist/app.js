"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const entries_1 = __importDefault(require("./routes/entries"));
const transcribe_1 = __importDefault(require("./routes/transcribe"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Debug logger
app.use((req, res, next) => {
    console.log('Gelen istek:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body,
        files: req.files
    });
    next();
});
// API routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/entries', entries_1.default);
app.use('/api/v1/transcribe', transcribe_1.default);
// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl
    });
    res.status(404).json({ error: 'Endpoint bulunamadı' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası', details: err.message });
});
exports.default = app;
