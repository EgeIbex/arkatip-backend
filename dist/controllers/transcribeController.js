"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscribeController = void 0;
const transcribeService_1 = require("../services/transcribeService");
class TranscribeController {
    static async transcribe(req, res) {
        try {
            if (!req.file) {
                console.log('Hata: Ses dosyası bulunamadı');
                return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
            }
            const transcript = await transcribeService_1.TranscribeService.transcribeAudio(req.file.buffer);
            res.json({ transcript });
        }
        catch (error) {
            res.status(500).json({
                error: 'Ses dosyası dönüştürülemedi',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
}
exports.TranscribeController = TranscribeController;
