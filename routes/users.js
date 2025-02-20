const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          Id, 
          Login_user, 
          Password_user, 
          Id_Roles, 
          Id_Parent, 
          Id_Teacher, 
          Id_Administration
      FROM Users;
    `);

    const users = result.recordset.map(user => ({
      id: user.Id,
      login: user.Login_user,
      password: user.Password_user,
      roleId: user.Id_Roles,
      parentId: user.Id_Parent,
      teacherId: user.Id_Teacher,
      adminId: user.Id_Administration
    }));

    res.json({
      message: "Пользователи получены успешно",
      data: users
    });
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;
