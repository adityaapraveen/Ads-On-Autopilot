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
app.use(cors());
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