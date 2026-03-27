import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { validate } from '../lib/validate.js';
import { NotFoundError } from '../lib/errors.js';

const router = Router();

const UpdateCampaignSchema = z.object({
    status: z.enum(['active', 'paused']).optional(),
    daily_budget: z.number().positive().optional(),
}).strict();

// GET /campaigns — list all campaigns with computed metrics
router.get('/', asyncHandler(async (req, res) => {
    const { rows } = await query(`
    SELECT
      c.*,
      CASE WHEN c.clicks > 0
        THEN ROUND((c.revenue / c.spend)::numeric, 2)
        ELSE 0
      END AS roas,
      CASE WHEN c.impressions > 0
        THEN ROUND((c.clicks::numeric / c.impressions * 100), 2)
        ELSE 0
      END AS ctr,
      CASE WHEN c.clicks > 0
        THEN ROUND((c.spend / c.clicks)::numeric, 2)
        ELSE 0
      END AS cpc,
      COUNT(k.id) AS keyword_count
    FROM campaigns c
    LEFT JOIN keywords k ON k.campaign_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
    res.json({ data: rows });
}));

// GET /campaigns/:id — single campaign with its keywords
router.get('/:id', asyncHandler(async (req, res) => {
    const { rows: campaigns } = await query(
        `SELECT
      c.*,
      CASE WHEN c.clicks > 0
        THEN ROUND((c.revenue / c.spend)::numeric, 2)
        ELSE 0
      END AS roas,
      CASE WHEN c.impressions > 0
        THEN ROUND((c.clicks::numeric / c.impressions * 100), 2)
        ELSE 0
      END AS ctr,
      CASE WHEN c.clicks > 0
        THEN ROUND((c.spend / c.clicks)::numeric, 2)
        ELSE 0
      END AS cpc
    FROM campaigns c WHERE c.id = $1`,
        [req.params.id]
    );

    if (!campaigns.length) throw new NotFoundError('Campaign');

    const { rows: keywords } = await query(
        `SELECT
      k.*,
      CASE WHEN k.clicks > 0
        THEN ROUND((k.revenue / k.spend)::numeric, 2)
        ELSE 0
      END AS roas,
      CASE WHEN k.impressions > 0
        THEN ROUND((k.clicks::numeric / k.impressions * 100), 2)
        ELSE 0
      END AS ctr
    FROM keywords k
    WHERE k.campaign_id = $1
    ORDER BY k.spend DESC`,
        [req.params.id]
    );

    res.json({ data: { ...campaigns[0], keywords } });
}));

// PATCH /campaigns/:id — update status or budget
router.patch('/:id', validate(UpdateCampaignSchema), asyncHandler(async (req, res) => {
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
        `UPDATE campaigns SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
    );

    if (!rows.length) throw new NotFoundError('Campaign');

    res.json({ data: rows[0] });
}));

export default router;