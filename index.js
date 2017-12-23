const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');

const app = express();

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(expressValidator());

function exceptionHandler(err, req, res) {
    console.error('an error occured');
    console.error(err);
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}

const therapists = [{
    id: 123,
    name: 'Test therapist'
}];

app.get('/therapist', (req, res) => { throw new Error('err') })


app.use((err, req, res, next) => exceptionHandler(err, req, res));
app.listen(3000, () => console.log('listening...'))