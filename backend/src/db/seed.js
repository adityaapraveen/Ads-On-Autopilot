import { z } from 'zod';
import { pool } from './client.js';

const CampaignSchema = z.object({
    name: z.string().min(1),
    daily_budget: z.number().positive(),
    spend: z.number().nonnegative(),
    impressions: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
});

const KeywordSchema = z.object({
    keyword: z.string().min(1),
    bid: z.number().positive(),
    impressions: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative(),
    spend: z.number().nonnegative(),
    revenue: z.number().nonnegative(),
});

const campaigns = [
    { name: 'Summer Sale - Running Shoes', daily_budget: 150.00, spend: 142.50, impressions: 18400, clicks: 312, revenue: 890.00 },
    { name: 'Wireless Headphones Launch', daily_budget: 200.00, spend: 88.20, impressions: 9200, clicks: 178, revenue: 1240.00 },
    { name: 'Kitchen Appliances - Q4', daily_budget: 100.00, spend: 101.80, impressions: 6100, clicks: 95, revenue: 310.00 },
];

const keywordsByCampaign = [
    [
        { keyword: 'running shoes men', bid: 1.20, impressions: 6200, clicks: 118, spend: 48.50, revenue: 340.00 },
        { keyword: 'best running shoes', bid: 1.80, impressions: 7100, clicks: 124, spend: 62.00, revenue: 420.00 },
        { keyword: 'nike running shoes', bid: 0.90, impressions: 5100, clicks: 70, spend: 32.00, revenue: 130.00 },
    ],
    [
        { keyword: 'wireless headphones', bid: 2.10, impressions: 4800, clicks: 96, spend: 45.00, revenue: 780.00 },
        { keyword: 'noise cancelling headphones', bid: 1.60, impressions: 2900, clicks: 52, spend: 28.00, revenue: 360.00 },
        { keyword: 'bluetooth headphones under 100', bid: 0.80, impressions: 1500, clicks: 30, spend: 15.20, revenue: 100.00 },
    ],
    [
        { keyword: 'air fryer', bid: 1.40, impressions: 2800, clicks: 44, spend: 42.00, revenue: 160.00 },
        { keyword: 'instant pot sale', bid: 1.10, impressions: 2100, clicks: 32, spend: 36.80, revenue: 98.00 },
        { keyword: 'kitchen gadgets gift', bid: 0.60, impressions: 1200, clicks: 19, spend: 23.00, revenue: 52.00 },
    ],
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM keywords');
        await client.query('DELETE FROM campaigns');

        for (let i = 0; i < campaigns.length; i++) {
            const campaign = CampaignSchema.parse(campaigns[i]);

            const { rows } = await client.query(
                `INSERT INTO campaigns (name, daily_budget, spend, impressions, clicks, revenue)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
                [campaign.name, campaign.daily_budget, campaign.spend,
                campaign.impressions, campaign.clicks, campaign.revenue]
            );
            const campaignId = rows[0].id;

            for (const kw of keywordsByCampaign[i]) {
                const keyword = KeywordSchema.parse(kw);
                await client.query(
                    `INSERT INTO keywords (campaign_id, keyword, bid, impressions, clicks, spend, revenue)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                    [campaignId, keyword.keyword, keyword.bid,
                        keyword.impressions, keyword.clicks, keyword.spend, keyword.revenue]
                );
            }
        }

        await client.query('COMMIT');
        console.log('Seed complete — 3 campaigns, 9 keywords inserted.');
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.name === 'ZodError') {
            console.error('Seed validation failed:', JSON.stringify(err.errors, null, 2));
        } else {
            console.error('Seed failed:', err.message);
        }
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();