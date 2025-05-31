import { Router } from 'express';
import { EntryController } from '../controllers/entryController';
import { authMiddleware } from '../middleware/auth';

console.log('Entries route yükleniyor...');

const router = Router();

// Tüm girişleri getir
router.get('/', authMiddleware, EntryController.getEntries);

// Yeni giriş oluştur
router.post('/', authMiddleware, EntryController.createEntry);

// Girişi güncelle
router.put('/:id', authMiddleware, EntryController.updateEntry);

// Girişi sil
router.delete('/:id', authMiddleware, EntryController.deleteEntry);

export default router; 