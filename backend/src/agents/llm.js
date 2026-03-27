import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config/index.js';

export const llm = new ChatOpenAI({
    modelName: config.openrouter.model,
    openAIApiKey: config.openrouter.apiKey,
    configuration: {
        baseURL: config.openrouter.baseURL,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Ad Optimizer',
        },
    },
    temperature: 0.2,
    maxRetries: 3,
});