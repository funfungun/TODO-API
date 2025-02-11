import express from 'express';
import mongoose from 'mongoose';
import { Task } from './task.js';
import * as dotenv from 'dotenv';

dotenv.config();
console.log(process.env.DATABASE_URL);
const app = express();
app.use(express.json());

await mongoose.connect(process.env.DATABASE_URL);

const asyncHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (e) {
        if (e.name === 'ValidationError') {
            res.status(400).send({ message: e.message });
        } else if (e.name === 'CastError') {
            res.status(404).send({ message: e.message });
        } else {
            res.status(500).send({ message: e.message });
        }
    }
};

app.post(
    '/tasks',
    asyncHandler(async (req, res) => {
        const data = req.body;
        const newTask = await Task.create(data);
        res.status(201).send(newTask);
    })
);

app.get(
    '/tasks',
    asyncHandler(async (req, res) => {
        const count = Number(req.query.count) || 0;
        const sortOption = req.query.sort === 'oldest' ? ['createdAt', 'asc'] : ['createdAt', 'desc'];
        const tasks = await Task.find().limit(count).sort([sortOption]);
        res.status(201).send(tasks);
    })
);

app.get(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);
        if (task) {
            res.send(task);
        } else {
            res.status(404).send({ message: 'Cannot find given id' });
        }
    })
);

app.patch(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);
        if (task) {
            Object.keys(req.body).forEach((keys) => {
                task[keys] = req.body[keys];
            });
            await task.save();
            res.send(task);
        } else {
            res.status(404).send({ message: 'Cannot find given id' });
        }
    })
);

app.delete(
    '/tasks/:id',
    asyncHandler(async (req, res) => {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (task) {
            res.sendStatus(200);
        } else {
            res.status(404).send({ message: 'Cannot find given id' });
        }
    })
);

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
