const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');

const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'telefon';
const app = express();

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(expressValidator());

(async () => {
    const dbClient = await MongoClient.connect(url);
    const db = dbClient.db(dbName);
    const therapistCollection = db.collection('therapist');

    function exceptionHandler(err, req, res) {
        console.error('an error occured');
        console.error(err);
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    app.get('/therapist', async (req, res, next) => (async (req, res) => {
        const list = await therapistCollection.find({}).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/therapist/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const therapist = await therapistCollection.findOne(id);
        console.log(JSON.stringify(therapist));
        res.json(therapist);
    })(req, res).catch(next));

    app.post('/therapist', (req, res, next) => (async (req, res) => {
        const therapist = req.body;
        const result = await therapistCollection.insertOne(therapist);
        if(result.insertedCount === 1){
            res.set('Location', `/therapist/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/therapist/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const therapist = req.body;
        const result = await therapistCollection.updateOne(id, therapist);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/therapist/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await therapistCollection.deleteOne(id);
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.use((err, req, res, next) => exceptionHandler(err, req, res));
    app.listen(3000, () => console.log('listening...'))
})();