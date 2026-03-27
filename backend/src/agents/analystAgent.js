import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { llm } from './llm.js';
import { getCampaigns, getKeywordsForCampaign } from '../tools/campaignTools.js';

const analystTools = [getCampaigns, getKeywordsForCampaign];
const analystLLM = llm.bindTools(analystTools);

const SYSTEM_PROMPT = `You are an Amazon advertising analyst. Your job is to:
1. Call get_campaigns to fetch all active campaigns
2. For EVERY campaign returned, call get_keywords_for_campaign with that campaign's id
3. After fetching all data, respond with a brief summary of what you found

You MUST fetch keywords for every single campaign. Do not skip any.`;

export async function analystAgent(state) {
    console.log('[Analyst] Starting campaign analysis...');

    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(
            `Run a full analysis of all active campaigns. Agent run ID: ${state.agentRunId}`
        ),
    ];

    // Track results by tool name so we never confuse campaigns with keywords
    const toolResults = {
        get_campaigns: null,
        get_keywords_for_campaign: [],
    };

    // Agentic loop — runs until the LLM stops calling tools
    let iterations = 0;
    const MAX_ITERATIONS = 20;

    while (iterations < MAX_ITERATIONS) {
        iterations++;
        const response = await analystLLM.invoke(messages);
        messages.push(response);

        if (!response.tool_calls || response.tool_calls.length === 0) {
            break;
        }

        for (const toolCall of response.tool_calls) {
            const tool = analystTools.find((t) => t.name === toolCall.name);
            if (!tool) continue;

            const result = await tool.invoke(toolCall.args);

            // Store by tool name so we always know what came from where
            if (toolCall.name === 'get_campaigns') {
                toolResults.get_campaigns = JSON.parse(result);
            } else if (toolCall.name === 'get_keywords_for_campaign') {
                const keywords = JSON.parse(result);
                toolResults.get_keywords_for_campaign.push(...keywords);
            }

            messages.push(
                new ToolMessage({
                    tool_call_id: toolCall.id,
                    content: result,
                })
            );
        }
    }

    const campaigns = toolResults.get_campaigns || [];
    const keywords = toolResults.get_keywords_for_campaign;

    console.log(
        `[Analyst] Found ${campaigns.length} campaigns, ${keywords.length} keywords`
    );

    return {
        campaigns,
        keywords,
        currentAgent: 'bidOptimizer',
    };
}