"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const transcribeController_1 = require("../controllers/transcribeController");
const router = express_1.default.Router();
// Multer yapılandırması
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('Dosya yükleniyor:', {
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        if (file.mimetype.startsWith('audio/')) {
            console.log('Geçerli ses dosyası');
            cb(null, true);
        }
        else {
            console.log('Geçersiz dosya tipi:', file.mimetype);
            cb(new Error('Sadece ses dosyaları kabul edilir'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
// Multer hata yakalama middleware'i
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        console.error('Multer hatası:', err);
        return res.status(400).json({ error: 'Dosya yükleme hatası', details: err.message });
    }
    else if (err) {
        console.error('Dosya yükleme hatası:', err);
        return res.status(400).json({ error: err.message });
    }
    next();
};
// Route tanımı
router.post('/', handleMulterError, upload.single('audio'), async (req, res, next) => {
    try {
        console.log('Transcribe isteği alındı');
        console.log('Headers:', req.headers);
        console.log('Files:', req.file);
        console.log('Body:', req.body);
        if (!req.file) {
            console.log('Hata: Ses dosyası bulunamadı');
            return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
        }
        console.log('Ses dosyası detayları:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? 'Buffer mevcut' : 'Buffer yok'
        });
        await transcribeController_1.TranscribeController.transcribe(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
