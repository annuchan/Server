const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          *
      FROM Important_information e
      LEFT JOIN Photo p ON e.id_photo = p.id;
    `);

    const importantInformations = result.recordset.map(item => ({
      id: item.Id,
      title: item.Title,
      describe: item.Describe,
      term: item.Term,
      date: item.Datee,
      imageName: item.imagename,
      imageData: item.imagedata ? Buffer.from(item.imagedata).toString("base64") : null,
    }));
    res.json(importantInformations);
  } catch (error) {
    console.error("Ошибка при получении данных о важной информации:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router; 