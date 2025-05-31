"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryController = void 0;
const entry_1 = require("../models/entry");
const interpretationService_1 = require("../services/interpretationService");
console.log('EntryController yükleniyor...');
console.log('InterpretationService import edildi:', !!interpretationService_1.InterpretationService);
class EntryController {
    static async getEntries(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            }
            const entries = await entry_1.Entry.findByUserId(userId);
            res.json(entries);
        }
        catch (error) {
            console.error('Girişler getirilirken hata:', error);
            res.status(500).json({ error: 'Girişler getirilemedi' });
        }
    }
    static async createEntry(req, res) {
        var _a;
        try {
            const { content } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            console.log('Rüya kaydetme isteği alındı:', { content, userId });
            if (!userId) {
                return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            }
            let interpretation = null;
            try {
                // Rüyayı yorumla
                console.log('InterpretationService başlatılıyor...');
                console.log('InterpretationService:', interpretationService_1.InterpretationService);
                console.log('OpenAI yorumlama isteği gönderiliyor...');
                interpretation = await interpretationService_1.InterpretationService.interpretDream(content);
                console.log('OpenAI yanıtı alındı:', interpretation);
            }
            catch (interpretError) {
                console.error('Yorumlama hatası:', interpretError);
                // Yorumlama hatası olsa bile rüyayı kaydet
                interpretation = 'Yorum yapılamadı.';
            }
            console.log('Veritabanına kayıt yapılıyor...');
            const entry = await entry_1.Entry.create({
                content,
                interpretation,
                userId,
                date: new Date()
            });
            console.log('Rüya başarıyla kaydedildi:', entry);
            res.status(201).json(entry);
        }
        catch (error) {
            console.error('Rüya kaydetme hatası:', error);
            res.status(500).json({ error: 'Rüya kaydedilirken bir hata oluştu' });
        }
    }
    static async updateEntry(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            }
            const entry = await entry_1.Entry.findById(id);
            if (!entry || entry.userId !== userId) {
                return res.status(404).json({ error: 'Giriş bulunamadı' });
            }
            const updatedEntry = await entry_1.Entry.update(id, { content });
            res.json(updatedEntry);
        }
        catch (error) {
            console.error('Giriş güncellenirken hata:', error);
            res.status(500).json({ error: 'Giriş güncellenemedi' });
        }
    }
    static async deleteEntry(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            }
            const entry = await entry_1.Entry.findById(id);
            if (!entry || entry.userId !== userId) {
                return res.status(404).json({ error: 'Giriş bulunamadı' });
            }
            await entry_1.Entry.delete(id);
            res.status(204).send();
        }
        catch (error) {
            console.error('Giriş silinirken hata:', error);
            res.status(500).json({ error: 'Giriş silinemedi' });
        }
    }
}
exports.EntryController = EntryController;
