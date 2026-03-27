import { Router } from 'express';
import { query } from '../db/client.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { NotFoundError } from '../lib/errors.js';

const router = Router();

// GET /agent-runs — list all runs, most recent first
router.get('/', asyncHandler(async (req, res) => {
    const { rows } = await query(`
    SELECT
      r.*,
      COUNT(d.id) AS decision_count
    FROM agent_runs r
    LEFT JOIN decision_logs d ON d.agent_run_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT 20
  `);
    res.json({ data: rows });
}));

// GET /agent-runs/:id — single run with all decision logs
router.get('/:id', asyncHandler(async (req, res) => {
    const { rows: runs } = await query(
        'SELECT * FROM agent_runs WHERE id = $1',
        [req.params.id]
    );

    if (!runs.length) throw new NotFoundError('Agent run');

    const { rows: decisions } = await query(
        `SELECT * FROM decision_logs
     WHERE agent_run_id = $1
     ORDER BY created_at ASC`,
        [req.params.id]
    );

    res.json({ data: { ...runs[0], decisions } });
}));

export default router;