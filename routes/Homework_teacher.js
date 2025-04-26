const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Получить расписание по выбранному дню
router.get('/:teacherId/:day', async (req, res) => {
    const { teacherId, day } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('teacherId', sql.VarChar, teacherId)
            .input('day', sql.VarChar, day)
            .query('SELECT * FROM schedule WHERE teacher_id = @teacherId AND day = @day');
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'В этот день у вас нет уроков. Выберите другой день.' });
        }
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка при получении расписания:', error);
        res.status(500).json({ error: error.message });
    }
});

// Добавить, редактировать или удалить урок
router.post('/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    const { subject, day, time, action } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        if (action === 'add') {
            const checkResult = await pool.request()
                .input('teacherId', sql.VarChar, teacherId)
                .input('day', sql.VarChar, day)
                .input('subject', sql.VarChar, subject)
                .query('SELECT * FROM schedule WHERE teacher_id = @teacherId AND day = @day AND subject = @subject');
            if (checkResult.recordset.length > 0) {
                return res.status(400).json({ message: 'Некорректное действие или урок уже существует.' });
            }
            await pool.request()
                .input('teacherId', sql.VarChar, teacherId)
                .input('subject', sql.VarChar, subject)
                .input('day', sql.VarChar, day)
                .input('time', sql.VarChar, time)
                .query('INSERT INTO schedule (teacher_id, subject, day, time) VALUES (@teacherId, @subject, @day, @time)');
            res.json({ message: 'Урок добавлен.' });
        } else if (action === 'edit') {
            const checkResult = await pool.request()
                .input('teacherId', sql.VarChar, teacherId)
                .input('day', sql.VarChar, day)
                .input('subject', sql.VarChar, subject)
                .query('SELECT * FROM schedule WHERE teacher_id = @teacherId AND day = @day AND subject = @subject');
            if (checkResult.recordset.length === 0) {
                return res.status(400).json({ message: 'Некорректное действие или урок не найден.' });
            }
            await pool.request()
                .input('time', sql.VarChar, time)
                .input('teacherId', sql.VarChar, teacherId)
                .input('day', sql.VarChar, day)
                .input('subject', sql.VarChar, subject)
                .query('UPDATE schedule SET time = @time WHERE teacher_id = @teacherId AND day = @day AND subject = @subject');
            res.json({ message: 'Урок обновлен.' });
        } else if (action === 'delete') {
            const checkResult = await pool.request()
                .input('teacherId', sql.VarChar, teacherId)
                .input('day', sql.VarChar, day)
                .input('subject', sql.VarChar, subject)
                .query('SELECT * FROM schedule WHERE teacher_id = @teacherId AND day = @day AND subject = @subject');
            if (checkResult.recordset.length === 0) {
                return res.status(400).json({ message: 'Некорректное действие или урок не найден.' });
            }
            await pool.request()
                .input('teacherId', sql.VarChar, teacherId)
                .input('day', sql.VarChar, day)
                .input('subject', sql.VarChar, subject)
                .query('DELETE FROM schedule WHERE teacher_id = @teacherId AND day = @day AND subject = @subject');
            res.json({ message: 'Урок удален.' });
        } else {
            res.status(400).json({ message: 'Некорректное действие или урок не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при работе с уроками:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
