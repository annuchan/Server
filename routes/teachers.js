const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const subject = req.query.subject;  // Получаем параметр 'subject' из запроса
  const query = `
    SELECT 
      t.Id, t.LastName, t.FirstName, t.MiddleName, 
      t.Specialty, t.Education, t.Experience, 
      t.Academic_Degree, t.Title, t.Certificate_Teacher, 
      t.Qualification, t.Professional_development, 
      t.PhoneNumber, t.Address_Teacher, t.Date_Of_Birth, 
      t.Id_Subject, t.Id_Passport, 
      p.imagename, p.imagedata
  FROM Teachers t
  LEFT JOIN Photo p ON t.id_image_teacher = p.id
  ${subject ? `WHERE t.Specialty = '${subject}'` : ''}
`;

const result = await pool.request().query(query);


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
      imageData: teacher.imagedata ? Buffer.from(teacher.imagedata).toString("base64") : null
    }));
    res.json(teachers);
  } catch (error) {
    console.error("Ошибка при получении данных о учителях:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router; 