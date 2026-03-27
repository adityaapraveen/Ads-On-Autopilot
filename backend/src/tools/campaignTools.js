import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { query } from '../db/client.js';

export const getCampaigns = tool(
    async () => {
        const { rows } = await query(`
      SELECT
        c.*,
        CASE WHEN c.spend > 0
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
      FROM campaigns c
      WHERE c.status = 'active'
      ORDER BY c.spend DESC
    `);
        return JSON.stringify(rows);
    },
    {
        name: 'get_campaigns',
        description: 'Fetch all active campaigns with spend, revenue, ROAS, CTR, and CPC metrics.',
    }
);

export const getKeywordsForCampaign = tool(
    async ({ campaign_id }) => {
        const { rows } = await query(
            `SELECT
        k.*,
        CASE WHEN k.spend > 0
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
            [campaign_id]
        );
        return JSON.stringify(rows);
    },
    {
        name: 'get_keywords_for_campaign',
        description: 'Fetch all keywords for a campaign with their performance metrics.',
        schema: z.object({
            campaign_id: z.string().uuid().describe('The campaign UUID to fetch keywords for'),
        }),
    }
);

export const updateKeywordBid = tool(
    async ({ keyword_id, new_bid }) => {
        const { rows } = await query(
            'UPDATE keywords SET bid = $1 WHERE id = $2 RETURNING id, keyword, bid',
            [new_bid, keyword_id]
        );
        if (!rows.length) return JSON.stringify({ error: 'Keyword not found' });
        return JSON.stringify({ success: true, updated: rows[0] });
    },
    {
        name: 'update_keyword_bid',
        description: 'Update the bid for a specific keyword.',
        schema: z.object({
            keyword_id: z.string().uuid().describe('The keyword UUID to update'),
            new_bid: z.number().positive().describe('The new bid amount in dollars'),
        }),
    }
);

export const pauseKeyword = tool(
    async ({ keyword_id }) => {
        const { rows } = await query(
            "UPDATE keywords SET status = 'paused' WHERE id = $1 RETURNING id, keyword, status",
            [keyword_id]
        );
        if (!rows.length) return JSON.stringify({ error: 'Keyword not found' });
        return JSON.stringify({ success: true, updated: rows[0] });
    },
    {
        name: 'pause_keyword',
        description: 'Pause a keyword that is underperforming or causing budget overrun.',
        schema: z.object({
            keyword_id: z.string().uuid().describe('The keyword UUID to pause'),
        }),
    }
);

export const pauseCampaign = tool(
    async ({ campaign_id }) => {
        const { rows } = await query(
            "UPDATE campaigns SET status = 'paused' WHERE id = $1 RETURNING id, name, status",
            [campaign_id]
        );
        if (!rows.length) return JSON.stringify({ error: 'Campaign not found' });
        return JSON.stringify({ success: true, updated: rows[0] });
    },
    {
        name: 'pause_campaign',
        description: 'Pause an entire campaign that has exceeded its daily budget.',
        schema: z.object({
            campaign_id: z.string().uuid().describe('The campaign UUID to pause'),
        }),
    }
);

// Factory function — agentRunId is injected server-side, never passed by the LLM
export const createLogDecision = (agentRunId) =>
    tool(
        async ({ agent_name, entity_type, entity_id, entity_name, action, reason, before_state, after_state }) => {
            await query(
                `INSERT INTO decision_logs
          (agent_run_id, agent_name, entity_type, entity_id, entity_name, action, reason, before_state, after_state)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [
                    agentRunId,
                    agent_name,
                    entity_type,
                    entity_id,
                    entity_name,
                    action,
                    reason,
                    JSON.stringify(before_state),
                    JSON.stringify(after_state),
                ]
            );
            return JSON.stringify({ success: true });
        },
        {
            name: 'log_decision',
            description: 'Log an agent decision for transparency and auditing.',
            schema: z.object({
                agent_name: z.string().describe('Name of the agent making this decision'),
                entity_type: z.enum(['campaign', 'keyword']),
                entity_id: z.string().uuid().describe('UUID of the campaign or keyword acted on'),
                entity_name: z.string().describe('Human readable name of the entity'),
                action: z.string().describe('Short action label e.g. BID_INCREASED, KEYWORD_PAUSED'),
                reason: z.string().describe('Human-readable explanation of why this decision was made'),
                before_state: z.record(z.any()).describe('State before the action'),
                after_state: z.record(z.any()).describe('State after the action'),
            }),
        }
    );