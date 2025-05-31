import { Router } from 'express';
import { EntryController } from '../controllers/entryController';
import { auth } from '../middleware/auth';

const router = Router();

// Tüm girişleri getir
router.get('/', auth, EntryController.getEntries);

// Yeni giriş oluştur
router.post('/', auth, EntryController.createEntry);

// Girişi güncelle
router.put('/:id', auth, EntryController.updateEntry);

// Girişi sil
router.delete('/:id', auth, EntryController.deleteEntry);

export default router; 