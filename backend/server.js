const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env dosyasını yükle
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// JWT Secret değeri
process.env.JWT_SECRET = process.env.JWT_SECRET || 'saglik_merkezi_gizli_anahtar';

// Express uygulamasını oluştur
const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Hata ayıklama için request/response logging middleware'i
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Sağlık Merkezi API çalışıyor!' });
});

// Rotalar
app.use('/api/auth', authRoutes);

// 404 Route - En sonda tanımlanmalı
app.use((req, res) => {
  console.log(`[404] Route bulunamadı: ${req.method} ${req.url}`);
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
  
  // Veritabanı bağlantısını test et
  await testConnection();
});