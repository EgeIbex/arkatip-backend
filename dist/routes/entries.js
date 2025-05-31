"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const entryController_1 = require("../controllers/entryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Tüm girişleri getir
router.get('/', auth_1.authMiddleware, entryController_1.EntryController.getEntries);
// Yeni giriş oluştur
router.post('/', auth_1.authMiddleware, entryController_1.EntryController.createEntry);
// Girişi güncelle
router.put('/:id', auth_1.authMiddleware, entryController_1.EntryController.updateEntry);
// Girişi sil
router.delete('/:id', auth_1.authMiddleware, entryController_1.EntryController.deleteEntry);
exports.default = router;
