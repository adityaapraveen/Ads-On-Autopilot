import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { llm } from './llm.js';
import { updateKeywordBid, createLogDecision } from '../tools/campaignTools.js';

const SYSTEM_PROMPT = `You are a bid optimization agent. You adjust keyword bids based on performance.

Rules:
- ROAS > 4.0 AND CTR > 1%: increase bid by 15% (keyword is profitable, get more volume)
- ROAS between 1.5 and 4.0: keep bid unchanged (performing acceptably)
- ROAS < 1.5 AND spend > 10: decrease bid by 20% (underperforming but salvageable)
- ROAS < 1.0 AND spend > 20: decrease bid by 35% (actively losing money)

After every bid change, call log_decision with before_state and after_state.
Only act on keywords with status = 'active'. Never set a bid below $0.10.
Process ALL keywords in a single response using parallel tool calls, then stop.
Do NOT loop or re-fetch. Make all your decisions at once.`;

export async function bidOptimizerAgent(state) {
    console.log('[BidOptimizer] Analyzing keyword bids...');

    if (!state.keywords.length) {
        console.log('[BidOptimizer] No keywords to optimize');
        return { currentAgent: 'budgetManager', decisions: [] };
    }

    const logDecision = createLogDecision(state.agentRunId);
    const bidTools = [updateKeywordBid, logDecision];
    const bidLLM = llm.bindTools(bidTools);

    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(
            `Optimize bids for these keywords. Make all decisions now in one pass.\n\nKeywords:\n${JSON.stringify(state.keywords, null, 2)}`
        ),
    ];

    const decisions = [];
    let iterations = 0;
    const MAX_ITERATIONS = 5; // LLM should never need more than 2-3 rounds

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await bidLLM.invoke(messages);
        messages.push(response);

        const toolCalls = response.tool_calls ?? [];

        // No more tool calls — LLM is done
        if (toolCalls.length === 0) {
            console.log(`[BidOptimizer] Done after ${iterations} iteration(s)`);
            break;
        }

        console.log(`[BidOptimizer] Iteration ${iterations}: processing ${toolCalls.length} tool call(s)`);

        // Process ALL tool calls from this response before going back to LLM
        for (const toolCall of toolCalls) {
            const tool = bidTools.find((t) => t.name === toolCall.name);
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
                console.error(`[BidOptimizer] Tool ${toolCall.name} failed:`, err.message);
                messages.push(
                    new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify({ error: err.message }) })
                );
            }
        }
    }

    console.log(`[BidOptimizer] Made ${decisions.length} bid decisions`);
    return { currentAgent: 'budgetManager', decisions };
}