const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// Kullanıcı kaydı
async function createUser(userData) {
  const { tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, sifre, rol = 'hasta' } = userData;
  
  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(sifre, 10);
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, sifre, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, hashedPassword, rol]
    );
    return { id: result.insertId, tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, rol };
  } catch (error) {
    throw error;
  }
}

// Kullanıcı girişi
async function findUserByEmail(email) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// TC kimlik numarasıyla kullanıcı bulma
async function findUserByTcKimlik(tc_kimlik) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE tc_kimlik = ?', [tc_kimlik]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Kullanıcı ID'sine göre bulma
async function findUserById(id) {
  try {
    const [rows] = await pool.execute('SELECT id, tc_kimlik, ad_soyad, telefon, email, dogum_tarihi, rol FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByTcKimlik,
  findUserById
}; 