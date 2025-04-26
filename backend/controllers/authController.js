const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// JWT secret key (normalde .env dosyasında saklanmalı)
const JWT_SECRET = process.env.JWT_SECRET || 'saglik_merkezi_gizli_anahtar';

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, sifre, rol } = req.body;

    // Alanların kontrolü
    if (!tc_kimlik || !ad_soyad || !telefon || !email || !dogum_tarihi || !sifre) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    // TC Kimlik no kontrolü
    if (tc_kimlik.length !== 11 || !/^\d+$/.test(tc_kimlik)) {
      return res.status(400).json({ message: 'Geçerli bir TC Kimlik numarası giriniz' });
    }

    // E-posta formatı kontrolü
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    // Kullanıcı var mı kontrolü
    const existingUserByEmail = await userModel.findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    const existingUserByTcKimlik = await userModel.findUserByTcKimlik(tc_kimlik);
    if (existingUserByTcKimlik) {
      return res.status(400).json({ message: 'Bu TC Kimlik numarası zaten kayıtlı' });
    }

    // Yeni kullanıcı oluştur
    const newUser = await userModel.createUser({
      tc_kimlik,
      ad_soyad,
      telefon,
      email,
      dogum_tarihi,
      sifre,
      rol: rol || 'hasta' // Varsayılan rol
    });

    // JWT token oluştur
    const token = jwt.sign(
      { id: newUser.id, tc_kimlik: newUser.tc_kimlik, rol: newUser.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      user: {
        id: newUser.id,
        tc_kimlik: newUser.tc_kimlik,
        ad_soyad: newUser.ad_soyad,
        email: newUser.email,
        rol: newUser.rol
      },
      token
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    // Alanların kontrolü
    if (!email || !sifre) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur' });
    }

    // Kullanıcıyı bul
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(sifre, user.sifre);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, tc_kimlik: user.tc_kimlik, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        tc_kimlik: user.tc_kimlik,
        ad_soyad: user.ad_soyad,
        email: user.email,
        rol: user.rol
      },
      token
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kullanıcı bilgilerini getir
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Auth middleware'den gelen kullanıcı ID'si
    
    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        tc_kimlik: user.tc_kimlik,
        ad_soyad: user.ad_soyad,
        telefon: user.telefon,
        email: user.email,
        dogum_tarihi: user.dogum_tarihi,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Kullanıcı bilgisi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}; 