const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          s.Id AS id,
          s.Title AS title,
          s.Describe AS describe,
          s.Place AS place,
          t.LastName AS firstName,
          t.FirstName AS secondname,
          t.MiddleName AS thirsdname,
          p.imagename,
          p.imagedata
      FROM School_asset s
      LEFT JOIN Teachers t ON s.Id_Teacher = t.Id
      LEFT JOIN Photo p ON s.Id_Photo = p.Id;
    `);

    const schoolAsset = result.recordset.map(row => ({
      id: row.id,
      title: row.title,
      describe: row.describe,
      place: row.place,
      firstName: row.firstName,
      secondname: row.secondname,
      thirsdname: row.thirsdname,
      imageName: row.imagename,
      imageData: row.imagedata ? Buffer.from(row.imagedata).toString("base64") : null
    }));
    res.json(schoolAsset);
  } catch (error) {
    console.error("Ошибка при получении данных о School_asset:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router; 