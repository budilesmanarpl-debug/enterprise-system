const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Limit besar untuk handle gambar base64

// Rute Dasar untuk Health Check
app.get('/', (req, res) => {
  res.send('Server Backend Corp System Berjalan!');
});

// Inisialisasi Pool Koneksi MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Endpoint Audit Logs
app.get('/api/logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY modify_date DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { modifyBy, actionType, menuAsal, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO audit_logs (modify_by, action_type, menu_asal, description) VALUES (?, ?, ?, ?)',
      [modifyBy, actionType, menuAsal, description]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint News
app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news', async (req, res) => {
  const { title, category, content, date, author, image, modifyDate, modifyBy } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO news (title, category, content, date, author, image, modify_date, modify_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, content, date, author, image, modifyDate, modifyBy]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cek Koneksi saat server start
const startServer = async () => {
  try {
    await pool.getConnection();
    console.log('✅ Terhubung ke MySQL Database');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server backend berjalan di port ${PORT}`));
  } catch (err) {
    console.error('❌ Gagal koneksi database:', err.message);
  }
};

startServer();