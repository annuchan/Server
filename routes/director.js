const express = require("express");
const sql = require("mssql");
const router = express.Router();
const dbConfig = require('../config/dbConfig');

router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT 
                a.LastName, a.FirstName, a.MiddleName, i.imagedata
            FROM Administration a
            JOIN Director d ON a.Id = d.Id_Administration
            JOIN School_Info s ON d.Id_School = s.Id
            JOIN Photo i ON a.Id_Image = i.id
            WHERE s.Id = 1;
        `);

        const director = result.recordset[0];
        if (director) {
            res.json({
                LastName: director.LastName,
                FirstName: director.FirstName,
                MiddleName: director.MiddleName,
                ImageData: director.imagedata ? director.imagedata.toString("base64") : null,
            });
        } else {
            res.status(404).send("Директор не найден");
        }
    } catch (err) {
        console.error("Ошибка при получении данных о директоре:", err);
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
