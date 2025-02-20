const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT Id, Title 
      FROM Subjects;
    `);

    const subjects = result.recordset.map(subject => ({
      id: subject.Id,
      title: subject.Title
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Ошибка при получении данных о предметах:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;
