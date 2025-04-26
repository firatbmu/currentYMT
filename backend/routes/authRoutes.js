const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

// Kullanıcı bilgilerini getir (kimlik doğrulama gerekiyor)
router.get('/me', authMiddleware.authenticateToken, authController.getUserInfo);

module.exports = router; 