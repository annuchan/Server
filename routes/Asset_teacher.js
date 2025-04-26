const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// API для получения кружков учителя с расписанием
router.get('/:teacherId', async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input('teacherId', sql.Int, teacherId)
            .query(`
                SELECT 
                    s.Id AS id,
                    s.Title AS title,
                    s.Describe AS describe,
                    s.Place AS place,
                    t.LastName + ' ' + t.FirstName + ' ' + t.MiddleName AS teacherFIO,
                    p.imagename AS imageName,
                    p.imagedata AS imageData,
                    sc.Day AS dayOfWeek,
                    sc.Time AS startTime
                FROM School_asset s
                LEFT JOIN Teachers t ON s.Id_Teacher = t.Id
                LEFT JOIN Photo p ON s.Id_Photo = p.Id
                LEFT JOIN Schedule sc ON sc.Id_asset = s.Id
                WHERE s.Id_Teacher = @teacherId
                ORDER BY sc.Day, sc.Time;
            `);

        // Группируем результаты по кружкам
        const clubs = {};
        result.recordset.forEach(row => {
            if (!clubs[row.id]) {
                clubs[row.id] = {
                    id: row.id,
                    title: row.title,
                    describe: row.describe,
                    place: row.place,
                    teacherFIO: row.teacherFIO,
                    imageName: row.imageName,
                    imageData: row.imageData ? Buffer.from(row.imageData).toString("base64") : null,
                    schedules: []
                };
            }
            if (row.dayOfWeek && row.startTime) {
                clubs[row.id].schedules.push({
                    dayOfWeek: row.dayOfWeek,
                    startTime: row.startTime
                });
            }
        });

        res.json(Object.values(clubs));
    } catch (error) {
        console.error("Ошибка при получении данных о кружках:", error);
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
