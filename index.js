const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const HttpStatus = require('http-status-codes');
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');
const https = require('https');

const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const mongoHost =  process.env.MONGO_SERVICE_HOST || 'localhost';
const url = `mongodb://${mongoHost}:27017`;
const dbName = 'telefon';
const app = express();
const uploadPath = path.join(__dirname, 'public', 'files');

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(fileUpload());
var upperBound = '1gb';
app.use(bodyParser.raw({limit: upperBound}));
app.use(expressValidator());

(async () => {
    const dbClient = await MongoClient.connect(url);
    const db = dbClient.db(dbName);
    const userCollection = db.collection('guests');

    app.get('/api/user', async (req, res, next) => (async (req, res) => {
        const list = await userCollection.find().toArray();
        res.json(list);
    })(req, res).catch(next));

    app.post('/api/user', (req, res, next) => (async (req, res) => {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        if(result.insertedCount === 1){
            res.json(result.insertedId);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.use((err, req, res, next) =>  {
        console.error('an error occured');
        console.error(err);
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    app.listen(3000, () => console.log('listening...'))
})();