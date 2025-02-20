const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT *
      FROM School_Info
      WHERE Id = 1;
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Ошибка при получении данных о школе:", err);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router; 