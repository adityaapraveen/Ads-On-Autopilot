import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { llm } from './llm.js';
import { pauseKeyword, pauseCampaign, createLogDecision } from '../tools/campaignTools.js';

const SYSTEM_PROMPT = `You are a budget management agent. You protect campaigns from overspending.

Rules:
- If spend >= 100% of daily_budget: pause the entire campaign immediately
- If spend >= 95% of daily_budget: pause the single highest-spend keyword to slow down spend
- If spend < 95% of daily_budget: no action needed

After every action, call log_decision with clear before/after state and a human-readable reason.
Always prefer pausing a keyword over the whole campaign when possible.
Make all your decisions at once in a single response. Do not loop.`;

export async function budgetManagerAgent(state) {
    console.log('[BudgetManager] Checking campaign budgets...');

    const logDecision = createLogDecision(state.agentRunId);
    const budgetTools = [pauseKeyword, pauseCampaign, logDecision];
    const budgetLLM = llm.bindTools(budgetTools);

    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(
            `Review budgets and take action where needed. Make all decisions now.\n\nCampaigns:\n${JSON.stringify(state.campaigns, null, 2)}\n\nKeywords:\n${JSON.stringify(state.keywords, null, 2)}`
        ),
    ];

    const decisions = [];
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await budgetLLM.invoke(messages);
        messages.push(response);

        const toolCalls = response.tool_calls ?? [];

        if (toolCalls.length === 0) {
            console.log(`[BudgetManager] Done after ${iterations} iteration(s)`);
            break;
        }

        console.log(`[BudgetManager] Iteration ${iterations}: processing ${toolCalls.length} tool call(s)`);

        for (const toolCall of toolCalls) {
            const tool = budgetTools.find((t) => t.name === toolCall.name);
            if (!tool) {
                messages.push(
                    new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify({ error: 'Tool not found' }) })
                );
                continue;
            }

            try {
                const result = await tool.invoke(toolCall.args);
                decisions.push({ tool: toolCall.name, args: toolCall.args });
                messages.push(
                    new ToolMessage({ tool_call_id: toolCall.id, content: result })
                );
            } catch (err) {
                console.error(`[BudgetManager] Tool ${toolCall.name} failed:`, err.message);
                messages.push(
                    new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify({ error: err.message }) })
                );
            }
        }
    }

    console.log(`[BudgetManager] Made ${decisions.length} budget decisions`);
    return { currentAgent: 'reporter', decisions };
}