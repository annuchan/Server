const http = require('http');
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(cors());

const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
};

// Импорт маршрутов
const schoolInfoRouter = require('./routes/schoolInfo');
const directorRouter = require('./routes/director');
const teachersRouter = require('./routes/teachers');
const eventsRouter = require('./routes/events');
const importantInformationRouter = require('./routes/importantInformation');
const schoolAssetRouter = require('./routes/schoolAsset');
const homeworkRouter = require('./routes/Homework');
const subjectsRouter = require('./routes/subjects');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const scheduleDetailedRouter = require('./routes/scheduleDetailed');

// Подключение маршрутов
app.use('/api/School_Info', schoolInfoRouter);
app.use('/api/director', directorRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/Important_information', importantInformationRouter);
app.use('/api/School_asset', schoolAssetRouter);
app.use('/api/Homework', homeworkRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/scheduleDetailed', scheduleDetailedRouter);

// Запуск HTTPS сервера на указанном порту
http.createServer(options, app).listen(8443, () => {
    console.log('HTTPS сервер запущен на порту 8443');
});
