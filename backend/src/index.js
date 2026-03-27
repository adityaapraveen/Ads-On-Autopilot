import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './db/redis.js';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);

const PORT = process.env.PORT || 3001;

async function start() {
    await connectRedis();
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
}

start();