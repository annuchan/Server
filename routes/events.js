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
      FROM Measure e
      LEFT JOIN Photo p ON e.id_photo = p.id;
    `);

    const events = result.recordset.map(measure => ({
      id: measure.Id,
      title: measure.Title,
      describe: measure.Describe,
      type: measure.Typ,
      date: measure.Datee,
      imageName: measure.imagename,
      imageData: measure.imagedata ? Buffer.from(measure.imagedata).toString("base64") : null,
    }));
    res.json(events);
  } catch (error) {
    console.error("Ошибка при получении данных о мероприятиях:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;
