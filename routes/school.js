const express = require("express");
const sql = require("../server");
const router = express.Router();

router.get("/School_Info", async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * FROM School_Info WHERE Id = 1;
        `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Ошибка при получении данных о школе:", err);
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
