"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpretationService = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log('InterpretationService yükleniyor...');
dotenv_1.default.config();
console.log('dotenv yüklendi');
console.log('OpenAI API anahtarı:', process.env.OPENAI_API_KEY ? 'Mevcut' : 'Eksik');
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
console.log('OpenAI client oluşturuldu');
class InterpretationService {
    static async interpretDream(dreamText) {
        console.log('interpretDream metodu çağrıldı');
        try {
            if (!process.env.OPENAI_API_KEY) {
                console.error('OpenAI API anahtarı bulunamadı!');
                throw new Error('OpenAI API anahtarı bulunamadı');
            }
            console.log('OpenAI isteği gönderiliyor...');
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a dream interpreter who provides thoughtful and poetic interpretations in Turkish."
                    },
                    {
                        role: "user",
                        content: `You are a dream interpreter trained on both classical symbolism and modern psychological perspectives.
A user has recorded the following dream.

Return a structured and friendly explanation of what this dream might symbolize, including:

1. Symbolic meanings of key elements
2. A full interpretation of the emotional or psychological context
3. A closing message or reflection suggestion

Dream (Turkish):
"${dreamText}"

Respond in Turkish. Be respectful, thoughtful, and slightly poetic if appropriate.
Keep the response under 250 words.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });
            const interpretation = completion.choices[0].message.content || 'Yorum yapılamadı.';
            console.log('OpenAI yanıtı:', interpretation);
            return interpretation;
        }
        catch (error) {
            console.error('Rüya yorumlama hatası:', error);
            if (error instanceof Error) {
                console.error('Hata detayı:', error.message);
                console.error('Hata stack:', error.stack);
            }
            throw new Error('Rüya yorumlanırken bir hata oluştu.');
        }
    }
}
exports.InterpretationService = InterpretationService;
