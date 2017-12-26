const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');

const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'telefon';
const app = express();
const uploadPath = path.join(__dirname, 'public', 'files');

app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
var upperBound = '1gb';
app.use(bodyParser.raw({limit: upperBound}));
app.use(expressValidator());
app.use('/public', express.static('public'));

(async () => {
    const dbClient = await MongoClient.connect(url);
    const db = dbClient.db(dbName);
    const userCollection = db.collection('user');
    const fileCollection = db.collection('file');
    const therapyCollection = db.collection('therapy');
    const exerciseCollection = db.collection('exercise');
    const taskCollection = db.collection('task');
    const stepCollection = db.collection('step');
    const assignmentCollection = db.collection('assignment');

    app.get('/api/user', async (req, res, next) => (async (req, res) => {
        const isTherapistFilter = req.query['isTherapist'];
        const filter = {};
        if(isTherapistFilter){
            filter.isTherapist = isTherapistFilter === 'true';
        }
        const list = await userCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/user/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const user = await userCollection.findOne(id);
        res.json(user);
    })(req, res).catch(next));

    app.get('/api/validate/user', (req, res, next) => (async (req, res) => {
        const email = req.query['email'];   
        const user = await userCollection.findOne({ email: email });
        res.json((user === null));
    })(req, res).catch(next));

    app.post('/api/user', (req, res, next) => (async (req, res) => {
        const user = req.body;
        const existingUser = await userCollection.findOne({ email: user.email });
        if(existingUser !== null){
            res.sendStatus(HttpStatus.CONFLICT);
        }else{
            const result = await userCollection.insertOne(user);
            if(result.insertedCount === 1){
                res.set('Location', `/api/user/${result.insertedId}`);
                res.sendStatus(HttpStatus.CREATED);
            }else{
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    })(req, res).catch(next));

    app.put('/api/user/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const user = req.body;
        const result = await userCollection.updateOne(id, user);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/user/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await userCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.get('/api/therapy', async (req, res, next) => (async (req, res) => {
        const therapistFilter = req.query['therapist'];
        const patientFilter = req.query['patient'];
        const filter = {};
        if(therapistFilter){
            filter.therapistId = therapistFilter;
        }
        if(patientFilter){
            filter.patientId = patientFilter;
        }
        const list = await therapyCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/therapy/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const therapy = await therapyCollection.findOne(id);
        res.json(therapy);
    })(req, res).catch(next));

    app.post('/api/therapy', (req, res, next) => (async (req, res) => {
        const therapy = req.body;
        const result = await therapyCollection.insertOne(therapy);
        if(result.insertedCount === 1){
            res.set('Location', `/api/therapy/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/api/therapy/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const therapist = req.body;
        const result = await therapyCollection.updateOne(id, therapist);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/therapy/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await therapyCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.get('/api/exercise', async (req, res, next) => (async (req, res) => {
        const therapistFilter = req.query['therapist'];
        if(!therapistFilter){
            console.log('filter needed');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            return;
        }
        const filter = { 
            $or: [
                { 
                    therapistId: therapistFilter,
                    isGlobal: false,
                },
                {
                    isGlobal: true
                }
            ]
        };
        const list = await exerciseCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/exercise/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const exercise = await exerciseCollection.findOne(id);
        res.json(exercise);
    })(req, res).catch(next));

    app.post('/api/exercise', (req, res, next) => (async (req, res) => {
        const exercise = req.body;
        const result = await exerciseCollection.insertOne(exercise);
        if(result.insertedCount === 1){
            res.set('Location', `/api/exercise/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/api/exercise/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const exercise = req.body;
        const result = await exerciseCollection.updateOne(id, exercise);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/exercise/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await exerciseCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.get('/api/task', async (req, res, next) => (async (req, res) => {
        const exerciseFilter = req.query['exercise'];
        if(!exerciseFilter){
            console.log('exercise needed');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            return;
        }
        const filter = { 
            exerciseId: exerciseFilter,
        };
        const list = await taskCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/task/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const task = await taskCollection.findOne(id);
        res.json(task);
    })(req, res).catch(next));

    app.post('/api/task', (req, res, next) => (async (req, res) => {
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        if(result.insertedCount === 1){
            res.set('Location', `/api/task/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/api/task/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const task = req.body;
        const result = await taskCollection.updateOne(id, task);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/task/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await taskCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.get('/api/step', async (req, res, next) => (async (req, res) => {
        const taskFilter = req.query['task'];
        if(!taskFilter){
            console.log('step needed');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            return;
        }
        const filter = { 
            taskId: taskFilter,
        };
        const list = await stepCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/step/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const step = await stepCollection.findOne(id);
        res.json(step);
    })(req, res).catch(next));

    app.post('/api/step', (req, res, next) => (async (req, res) => {
        const step = req.body;
        const result = await stepCollection.insertOne(step);
        if(result.insertedCount === 1){
            res.set('Location', `/api/step/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/api/step/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const step = req.body;
        const result = await stepCollection.updateOne(id, step);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/step/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await stepCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.get('/api/assignment', async (req, res, next) => (async (req, res) => {
        const therapyFilter = req.query['therapy'];
        if(!therapyFilter){
            console.log('therapy needed');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            return;
        }
        const filter = { 
            therapyId: therapyFilter,
        };
        const list = await assignmentCollection.find(filter).toArray();
        res.json(list);
    })(req, res).catch(next));

    app.get('/api/assignment/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const assignment = await assignmentCollection.findOne(id);
        res.json(assignment);
    })(req, res).catch(next));

    app.post('/api/assignment', (req, res, next) => (async (req, res) => {
        const step = req.body;
        const result = await assignmentCollection.insertOne(step);
        if(result.insertedCount === 1){
            res.set('Location', `/api/assignment/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.put('/api/assignment/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const assignment = req.body;
        const result = await assignmentCollection.updateOne(id, assignment);
        if(result.upsertedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.delete('/api/assignment/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);
        const result = await assignmentCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.post('/api/file/:id/part/:part', (req, res, next) => (async (req, res) => {
        const id = req.params['id'];
        const part = req.params['part'];

        const fullPath = path.join(uploadPath, id);
        
        if(!fs.existsSync(fullPath)) {
            console.info(`creating folder ${fullPath}`);
            fs.mkdirSync(fullPath);
        }
        const filePath = path.join(fullPath, `${part}.temp`);

        console.info(`writing to file ${filePath}`);

        fs.writeFileSync(filePath, req.body);

        res.sendStatus(HttpStatus.OK);
        
    })(req, res).catch(next));

    app.post('/api/file', (req, res, next) => (async (req, res) => {
        const id = req.body['id'];
        const parts = req.body['parts'];
        const format = req.body['format'];

        const fullPath = path.join(uploadPath, id);
        
        if(!fs.existsSync(fullPath)) {
            throw new Error('no parts found');
        }
        const fileId = `${id}.webm`;
        const filePath = path.join(uploadPath, fileId);
        for(let part = 1; part < parts; part++){
            const partFilePath = path.join(fullPath, `${part}.temp`);
            const data = fs.readFileSync(partFilePath);
            fs.appendFileSync(filePath, data);
            fs.unlinkSync(partFilePath);
        }
        fs.rmdirSync(fullPath);
        const file = {
            format: format,
            pathInUploadFolder: fileId,
            createdOn: new Date()
        };
        const result = await fileCollection.insertOne(file);
        if(result.insertedCount === 1){
            res.set('Location', `/api/file/${result.insertedId}`);
            res.sendStatus(HttpStatus.CREATED);
        }else{
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    })(req, res).catch(next));

    app.get('/api/file/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const file = await fileCollection.findOne(id);
        res.json(file);
    })(req, res).catch(next));

    app.delete('/api/file/:id', (req, res, next) => (async (req, res) => {
        const id = ObjectId(req.params['id']);   
        const result = await fileCollection.deleteOne({ _id: id });
        if(result.deletedCount === 1){
            res.sendStatus(HttpStatus.OK);
        }else{
            res.sendStatus(HttpStatus.NOT_FOUND);
        }
    })(req, res).catch(next));

    app.use((err, req, res, next) =>  {
        console.error('an error occured');
        console.error(err);
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    app.listen(3000, () => console.log('listening...'))
})();