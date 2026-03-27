import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
    campaigns: Annotation({
        reducer: (_, next) => next,
        default: () => [],
    }),

    keywords: Annotation({
        reducer: (_, next) => next,
        default: () => [],
    }),

    decisions: Annotation({
        reducer: (prev, next) => [...prev, ...next],
        default: () => [],
    }),

    agentRunId: Annotation({
        reducer: (_, next) => next,
        default: () => null,
    }),

    currentAgent: Annotation({
        reducer: (_, next) => next,
        default: () => 'supervisor',
    }),

    summary: Annotation({
        reducer: (_, next) => next,
        default: () => '',
    }),

    errors: Annotation({
        reducer: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
});