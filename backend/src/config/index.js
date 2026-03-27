import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
    },

    db: {
        connectionString: process.env.DATABASE_URL,
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    langsmith: {
        apiKey: process.env.LANGSMITH_API_KEY,
        project: process.env.LANGSMITH_PROJECT || 'ad-optimizer',
    },
};