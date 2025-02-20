const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT Id, Login_user, Id_Roles 
                FROM Users 
                WHERE Login_user = @username AND Password_user = @password
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            // Здесь предполагается, что Id_Roles может принимать значения, например:
            // 1 - Родитель, 2 - Администрация, 3 - Учитель.
            res.json({
                message: "Авторизация успешна",
                token: "example-token", // Обычно здесь генерируют JWT
                userId: user.Id,
                roleId: user.Id_Roles
            });
        } else {
            res.status(401).json({ message: "Неверные учетные данные" });
        }
    } catch (err) {
        console.error("Ошибка при авторизации:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router; 