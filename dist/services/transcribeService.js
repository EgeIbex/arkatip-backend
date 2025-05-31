"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscribeService = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class TranscribeService {
    static async transcribeAudio(audioBuffer) {
        try {
            console.log('Ses dosyası boyutu:', audioBuffer.length, 'bytes');
            if (audioBuffer.length < 100) {
                throw new Error('Ses dosyası çok küçük veya boş');
            }
            // OpenAI API'ye dosyayı gönder
            console.log('OpenAI API isteği gönderiliyor...');
            const response = await openai.audio.transcriptions.create({
                file: new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' }),
                model: "whisper-1",
            });
            console.log('OpenAI API yanıtı alındı');
            return response.text;
        }
        catch (error) {
            console.error('Transcribe hatası:', error);
            if (error.status === 429) {
                throw new Error('OpenAI API kotası aşıldı. Lütfen API anahtarınızı kontrol edin.');
            }
            if (error.status === 401) {
                throw new Error('OpenAI API anahtarı geçersiz. Lütfen API anahtarınızı kontrol edin.');
            }
            throw new Error(`Ses dosyası işlenemedi: ${error.message}`);
        }
    }
}
exports.TranscribeService = TranscribeService;
