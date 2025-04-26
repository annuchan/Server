const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.post('/', async (req, res) => {
    const { task, evaluation, dateHomework, idSubject, idClass, id_teacher } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('task', sql.NVarChar(sql.MAX), task)
            .input('evaluation', sql.NVarChar(1), evaluation)
            .input('dateHomework', sql.Date, dateHomework)
            .input('idSubject', sql.Int, idSubject)
            .input('idClass', sql.Int, idClass)
            .input('id_teacher', sql.Int, id_teacher)
            .query('INSERT INTO Homework (Task, Evaluation, Date_Homework, Id_Subject, Id_Class, Id_teacher) VALUES (@task, @evaluation, @dateHomework, @idSubject, @idClass, @id_teacher)');
        res.json({ message: 'Домашнее задание добавлено.' });
    } catch (error) {
        console.error('Ошибка при добавлении домашнего задания:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
