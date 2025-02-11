import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Task } from './task.js';
import data from './seedData.js';

dotenv.config();

console.log('Start Seed');
await mongoose.connect(process.env.DATABASE_URL);

await Task.deleteMany({});
await Task.insertMany(data);

await mongoose.connection.close();
console.log('End seed');
