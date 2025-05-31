import { Response } from 'express';
import { Entry } from '../models/entry';
import { InterpretationService } from '../services/interpretationService';
import { AuthRequest } from '../types';

export class EntryController {
  static async getEntries(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      console.log('GetEntries - User ID:', userId);

      if (!userId) {
        console.log('GetEntries - User ID bulunamadı');
        return res.status(401).json({
            error: 'Yetkilendirme gerekli 1 - userId yok',
            debug: {
              user: req.user,
              headers: req.headers,
              authHeader: req.headers.authorization,
            },
          });
      }

      const entries = await Entry.findByUserId(userId);
      console.log('GetEntries - Bulunan giriş sayısı:', entries.length);
      res.json(entries);
    } catch (error) {
      console.error('Girişler getirilirken hata:', error);
      res.status(500).json({ error: 'Girişler getirilemedi' });
    }
  }

  static async createEntry(req: AuthRequest, res: Response) {
    try {
      const { content } = req.body;
      const userId = req.user?.id;
      console.log('CreateEntry - User ID:', userId);

      if (!userId) {
        console.log('CreateEntry - User ID bulunamadı');
        return res.status(401).json({ error: 'Yetkilendirme gerekli 2' });
      }

      let interpretation = null;
      try {
        interpretation = await InterpretationService.interpretDream(content);
      } catch (interpretError) {
        console.error('Yorumlama hatası:', interpretError);
        interpretation = 'Yorum yapılamadı.';
      }

      const entry = await Entry.create({
        content,
        interpretation,
        userId,
        date: new Date()
      });

      console.log('CreateEntry - Yeni giriş oluşturuldu:', entry.id);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Rüya kaydetme hatası:', error);
      res.status(500).json({ error: 'Rüya kaydedilirken bir hata oluştu' });
    }
  }

  static async updateEntry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;
      console.log('UpdateEntry - User ID:', userId);

      if (!userId) {
        console.log('UpdateEntry - User ID bulunamadı');
        return res.status(401).json({ error: 'Yetkilendirme gerekli 3' });
      }

      const entry = await Entry.findById(id);
      if (!entry || entry.userId !== userId) {
        console.log('UpdateEntry - Giriş bulunamadı veya yetkisiz erişim');
        return res.status(404).json({ error: 'Giriş bulunamadı' });
      }

      const updatedEntry = await Entry.update(id, { content });
      console.log('UpdateEntry - Giriş güncellendi:', id);
      res.json(updatedEntry);
    } catch (error) {
      console.error('Giriş güncellenirken hata:', error);
      res.status(500).json({ error: 'Giriş güncellenemedi' });
    }
  }

  static async deleteEntry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      console.log('DeleteEntry - User ID:', userId);

      if (!userId) {
        console.log('DeleteEntry - User ID bulunamadı');
        return res.status(401).json({ error: 'Yetkilendirme gerekli 4' });
      }

      const entry = await Entry.findById(id);
      if (!entry || entry.userId !== userId) {
        console.log('DeleteEntry - Giriş bulunamadı veya yetkisiz erişim');
        return res.status(404).json({ error: 'Giriş bulunamadı' });
      }

      await Entry.delete(id);
      console.log('DeleteEntry - Giriş silindi:', id);
      res.status(204).send();
    } catch (error) {
      console.error('Giriş silinirken hata:', error);
      res.status(500).json({ error: 'Giriş silinemedi' });
    }
  }
} 