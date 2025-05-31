import { Request, Response } from 'express';
import { Entry } from '../models/entry';
import { InterpretationService } from '../services/interpretationService';
import { AuthenticatedRequest } from '../types/express';

export class EntryController {
  static async getEntries(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const entries = await Entry.findByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error('Girişler getirilirken hata:', error);
      res.status(500).json({ error: 'Girişler getirilemedi' });
    }
  }

  static async createEntry(req: AuthenticatedRequest, res: Response) {
    try {
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      let interpretation = null;
      try {
        interpretation = await InterpretationService.interpretDream(content);
      } catch (interpretError) {
        // Yorumlama hatası olsa bile rüyayı kaydet
        interpretation = 'Yorum yapılamadı.';
      }

      const entry = await Entry.create({
        content,
        interpretation,
        userId,
        date: new Date()
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error('Rüya kaydetme hatası:', error);
      res.status(500).json({ error: 'Rüya kaydedilirken bir hata oluştu' });
    }
  }

  static async updateEntry(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const entry = await Entry.findById(id);
      if (!entry || entry.userId !== userId) {
        return res.status(404).json({ error: 'Giriş bulunamadı' });
      }

      const updatedEntry = await Entry.update(id, { content });
      res.json(updatedEntry);
    } catch (error) {
      console.error('Giriş güncellenirken hata:', error);
      res.status(500).json({ error: 'Giriş güncellenemedi' });
    }
  }

  static async deleteEntry(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
      }

      const entry = await Entry.findById(id);
      if (!entry || entry.userId !== userId) {
        return res.status(404).json({ error: 'Giriş bulunamadı' });
      }

      await Entry.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Giriş silinirken hata:', error);
      res.status(500).json({ error: 'Giriş silinemedi' });
    }
  }
} 