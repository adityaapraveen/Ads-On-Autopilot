import { Router } from 'express';
import { query } from '../db/client.js';
import { redis } from '../db/redis.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/errors.js';
import { createAndRunGraph } from '../agents/supervisorGraph.js';

const router = Router();

const LOCK_KEY = 'agent:running';
const LOCK_TTL = 300;

router.post('/', asyncHandler(async (req, res) => {
    const isRunning = await redis.get(LOCK_KEY);
    if (isRunning) {
        throw new AppError(
            'An optimization run is already in progress',
            409,
            'RUN_IN_PROGRESS'
        );
    }

    const { rows } = await query(
        `INSERT INTO agent_runs (status) VALUES ('running') RETURNING id`
    );
    const agentRunId = rows[0].id;

    await redis.setEx(LOCK_KEY, LOCK_TTL, agentRunId);

    // Send response FIRST — fully closes the request lifecycle
    res.status(202).json({
        message: 'Optimization run started',
        agentRunId,
    });

    // Detach from request with setImmediate — errors here can never
    // touch the already-sent response
    setImmediate(async () => {
        try {
            await createAndRunGraph(agentRunId);
            console.log(`[Optimize] Run ${agentRunId} completed successfully`);
        } catch (err) {
            console.error(`[Optimize] Run ${agentRunId} failed:`, err.message);
            await query(
                `UPDATE agent_runs SET status = 'failed', completed_at = NOW() WHERE id = $1`,
                [agentRunId]
            );
        } finally {
            await redis.del(LOCK_KEY);
        }
    });
}));

router.get('/status', asyncHandler(async (req, res) => {
    const runningId = await redis.get(LOCK_KEY);
    res.json({
        isRunning: !!runningId,
        currentRunId: runningId || null,
    });
}));

export default router;