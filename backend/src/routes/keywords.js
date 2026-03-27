import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { validate } from '../lib/validate.js';
import { NotFoundError } from '../lib/errors.js';

const router = Router();

const UpdateKeywordSchema = z.object({
    bid: z.number().positive().optional(),
    status: z.enum(['active', 'paused']).optional(),
}).strict();

// GET /keywords?campaign_id=xxx — all keywords for a campaign
router.get('/', asyncHandler(async (req, res) => {
    const { campaign_id } = req.query;

    const { rows } = await query(
        `SELECT
      k.*,
      CASE WHEN k.clicks > 0
        THEN ROUND((k.revenue / k.spend)::numeric, 2)
        ELSE 0
      END AS roas,
      CASE WHEN k.impressions > 0
        THEN ROUND((k.clicks::numeric / k.impressions * 100), 2)
        ELSE 0
      END AS ctr,
      CASE WHEN k.clicks > 0
        THEN ROUND((k.spend / k.clicks)::numeric, 2)
        ELSE 0
      END AS cpc
    FROM keywords k
    WHERE ($1::uuid IS NULL OR k.campaign_id = $1::uuid)
    ORDER BY k.spend DESC`,
        [campaign_id || null]
    );

    res.json({ data: rows });
}));

// PATCH /keywords/:id — update bid or status
router.patch('/:id', validate(UpdateKeywordSchema), asyncHandler(async (req, res) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(req.body)) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
    }

    if (!fields.length) {
        return res.json({ message: 'Nothing to update' });
    }

    values.push(req.params.id);

    const { rows } = await query(
        `UPDATE keywords SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
    );

    if (!rows.length) throw new NotFoundError('Keyword');

    res.json({ data: rows[0] });
}));

export default router;