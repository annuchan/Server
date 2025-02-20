const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

// Получаем кружки + ФИО руководителя + расписание
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId; // Получаем userId из query параметров
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          sa.Id AS ClubId, sa.Title, sa.Describe, sa.Place, 
          t.FIO AS TeacherFIO, 
          p.imagename, p.imagedata,
          sd.DayOfWeek, sd.StartTime, sd.EndTime
        FROM Users u
        JOIN Parent pa ON u.Id_Parent = pa.Id
        JOIN Student s ON pa.Id_Student = s.Id
        JOIN School_asset sa ON s.Id_Asset = sa.Id
        LEFT JOIN Teacher t ON sa.Id_Teacher = t.Id
        LEFT JOIN Photo p ON sa.Id_Photo = p.Id
        LEFT JOIN ScheduleDetailed sd ON sa.Id = sd.Id_Club
        WHERE u.Id = @userId
        ORDER BY sd.DayOfWeek, sd.StartTime
      `);

    // Группируем расписание по клубам
    const clubsMap = new Map();

    result.recordset.forEach(row => {
      if (!clubsMap.has(row.ClubId)) {
        clubsMap.set(row.ClubId, {
          id: row.ClubId,
          title: row.Title,
          describe: row.Describe,
          place: row.Place,
          teacherFIO: row.TeacherFIO || "Не указан",
          imageName: row.imagename,
          imageData: row.imagedata ? Buffer.from(row.imagedata).toString("base64") : null,
          schedules: []
        });
      }

      if (row.DayOfWeek && row.StartTime && row.EndTime) {
        clubsMap.get(row.ClubId).schedules.push({
          dayOfWeek: row.DayOfWeek,
          startTime: row.StartTime,
          endTime: row.EndTime
        });
      }
    });

    res.json(Array.from(clubsMap.values()));
  } catch (err) {
    console.error("Ошибка при получении расписания:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
