import { StateGraph, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { analystAgent } from './analystAgent.js';
import { bidOptimizerAgent } from './bidOptimizerAgent.js';
import { budgetManagerAgent } from './budgetManagerAgent.js';
import { reporterAgent } from './reporterAgent.js';
import { query } from '../db/client.js';

function routeFromSupervisor(state) {
    const routes = {
        analyst: 'analyst',
        bidOptimizer: 'bidOptimizer',
        budgetManager: 'budgetManager',
        reporter: 'reporter',
        done: END,
    };
    return routes[state.currentAgent] ?? END;
}

export async function createAndRunGraph(agentRunId) {
    const graph = new StateGraph(AgentState)
        .addNode('analyst', analystAgent)
        .addNode('bidOptimizer', bidOptimizerAgent)
        .addNode('budgetManager', budgetManagerAgent)
        .addNode('reporter', reporterAgent)
        .addConditionalEdges('analyst', routeFromSupervisor)
        .addConditionalEdges('bidOptimizer', routeFromSupervisor)
        .addConditionalEdges('budgetManager', routeFromSupervisor)
        .addConditionalEdges('reporter', routeFromSupervisor)
        .setEntryPoint('analyst');

    const app = graph.compile();

    try {
        const finalState = await app.invoke(
            {
                agentRunId,
                currentAgent: 'analyst',
            },
            {
                // LangSmith traces every step automatically via env vars
                runName: `ad-optimizer-run-${agentRunId}`,
                tags: ['ad-optimizer', 'production'],
                metadata: { agentRunId },
            }
        );

        return finalState;
    } catch (err) {
        // Mark run as failed in the database
        await query(
            `UPDATE agent_runs SET status = 'failed', completed_at = NOW() WHERE id = $1`,
            [agentRunId]
        );
        throw err;
    }
}