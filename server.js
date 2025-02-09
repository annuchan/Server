const https = require('https');
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(cors());
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

https.createServer(options, app).listen(1433, () => {
    console.log('HTTPS сервер запущен на порту 1433');
});

// Параметры подключения к SQL Server
const dbConfig = {
    server: "192.168.0.5",
    user: 'ANNUCHAN',
    password: 'Bhbyf2004',
    database: "MyIdealClass",
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    authentication: {
        type: "default",
    },
    domain: "ANNUCHAN",
};

// Функция для подключения к БД
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("✅ Подключено к SQL Server");
    } catch (err) {
        console.error("❌ Ошибка подключения:", err);
    }
}

connectDB();

// **Эндпоинт для получения данных о школе**
app.get('/api/School_Info', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT 
                *
            FROM School_Info
            WHERE Id = 1;
        `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Ошибка при получении данных о школе:", err);
        res.status(500).send("Ошибка сервера");
    }
});

// **Эндпоинт для получения данных о директоре (ФИО и фото)**
app.get('/api/director', async (req, res) => {
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
                ImageData: director.imagedata ? director.imagedata.toString('base64') : null
            });
        } else {
            res.status(404).send("Директор не найден");
        }
    } catch (err) {
        console.error("Ошибка при получении данных о директоре:", err);
        res.status(500).send("Ошибка сервера");
    }
});

// **Эндпоинт для получения данных о учителях**
app.get("/api/teachers", async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT 
                t.Id, t.LastName, t.FirstName, t.MiddleName, 
                t.Specialty, t.Education, t.Experience, 
                t.Academic_Degree, t.Title, t.Certificate_Teacher, 
                t.Qualification, t.Professional_development, 
                t.PhoneNumber, t.Address_Teacher, t.Date_Of_Birth, 
                t.Id_Subject, t.Id_Passport, 
                p.imagename, p.imagedata
            FROM Teachers t
            LEFT JOIN Photo p ON t.id_image_teacher = p.id;
        `);

        const teachers = result.recordset.map(teacher => ({
            id: teacher.Id,
            lastName: teacher.LastName,
            firstName: teacher.FirstName,
            middleName: teacher.MiddleName,
            specialty: teacher.Specialty,
            education: teacher.Education,
            experience: teacher.Experience,
            academicDegree: teacher.Academic_Degree,
            title: teacher.Title,
            certificate: teacher.Certificate_Teacher,
            qualification: teacher.Qualification,
            professionalDevelopment: teacher.Professional_development,
            phoneNumber: teacher.PhoneNumber,
            address: teacher.Address_Teacher,
            dateOfBirth: teacher.Date_Of_Birth,
            idSubject: teacher.Id_Subject,
            idPassport: teacher.Id_Passport,
            imageName: teacher.imagename,
            imageData: teacher.imagedata ? Buffer.from(teacher.imagedata).toString("base64") : null,
            subjectId: teacher.SubjectId,  // Id предмета
            subjectTitle: teacher.SubjectTitle // Название предмета
        }));
        res.json(teachers);
    } catch (error) {
        console.error("Ошибка при получении данных о учителях:", error);
        res.status(500).send("Ошибка сервера");
    }
});

app.listen(3000, () => {
    console.log("🚀 Сервер запущен на порту 3000");
});
