const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          h.Id,
          h.Task,
          h.Evaluation,
          h.Date_Homework,
          c.Number_Class,
          c.Identifier,
          c.Id_Teacher,
          sub.Title AS SubjectTitle
      FROM Homework h
      LEFT JOIN Class c ON h.Id_Class = c.Id
      LEFT JOIN Subjects sub ON h.Id_Subject = sub.Id;
    `);

    const homework = result.recordset.map(hw => ({
      id: hw.Id,
      task: hw.Task,
      evaluation: hw.Evaluation,
      dateHomework: hw.Date_Homework,
      classNumber: hw.Number_Class,
      classIdentifier: hw.Identifier,
      teacherId: hw.Id_Teacher,
      subjectTitle: hw.SubjectTitle,
    }));
    res.json(homework);
  } catch (error) {
    console.error("Ошибка при получении данных о домашних заданиях:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;
