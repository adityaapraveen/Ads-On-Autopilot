import { ChatPromptTemplate } from '@langchain/core/prompts';
import { llm } from './llm.js';
import { query } from '../db/client.js';

const prompt = ChatPromptTemplate.fromMessages([
    [
        'system',
        `You are a reporting agent. Write a clear, concise optimization summary.

Your summary must include:
- Total campaigns reviewed
- Total keywords reviewed
- What bid changes were made and why
- What campaigns or keywords were paused and why
- Overall health assessment (Good / Needs Attention / Critical)

Keep it under 200 words. Write in plain English, not bullet points.`,
    ],
    [
        'human',
        `Write a summary of this optimization run.

Campaigns reviewed: {campaign_count}
Keywords reviewed: {keyword_count}
Decisions made: {decisions}`,
    ],
]);

export async function reporterAgent(state) {
    console.log('[Reporter] Writing optimization summary...');

    const response = await prompt.pipe(llm).invoke({
        campaign_count: state.campaigns.length,
        keyword_count: state.keywords.length,
        decisions: JSON.stringify(state.decisions, null, 2),
    });

    const summary = response.content;

    // Mark the agent run as completed in the database
    await query(
        `UPDATE agent_runs
     SET status = 'completed', summary = $1, completed_at = NOW()
     WHERE id = $2`,
        [summary, state.agentRunId]
    );

    console.log('[Reporter] Run complete. Summary written.');

    return { summary, currentAgent: 'done' };
}