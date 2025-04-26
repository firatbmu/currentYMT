const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// JWT secret key (normalde .env dosyasında saklanmalı)
const JWT_SECRET = process.env.JWT_SECRET || 'saglik_merkezi_gizli_anahtar';

// Token doğrulama middleware
exports.authenticateToken = async (req, res, next) => {
  try {
    // Authorization header'ını al
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" formatından TOKEN kısmını al
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kullanıcıyı veritabanından kontrol et
    const user = await userModel.findUserById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
    }

    // Kullanıcı bilgisini request nesnesine ekle
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Yetkilendirme hatası: Token süresi dolmuş' });
    }
    
    console.error('Token doğrulama hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Admin rol kontrolü middleware
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır. Yönetici yetkisi gerekli.' });
  }
};

// Doktor rol kontrolü middleware
exports.isDoctor = (req, res, next) => {
  if (req.user && (req.user.rol === 'doktor' || req.user.rol === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır. Doktor yetkisi gerekli.' });
  }
};

// Hasta rol kontrolü middleware
exports.isPatient = (req, res, next) => {
  if (req.user && (req.user.rol === 'hasta' || req.user.rol === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır.' });
  }
}; 