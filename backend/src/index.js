import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './db/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import campaignsRouter from './routes/campaigns.js';
import keywordsRouter from './routes/keywords.js';
import agentRunsRouter from './routes/agentRuns.js';
import optimizeRouter from './routes/optimize.js';

dotenv.config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: (origin, cb) => {
        // allow server-to-server / curl (no origin) and any whitelisted origin
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/campaigns', campaignsRouter);
app.use('/keywords', keywordsRouter);
app.use('/agent-runs', agentRunsRouter);
app.use('/optimize', optimizeRouter);


// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Central error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

async function start() {
    await connectRedis();
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
}

start();