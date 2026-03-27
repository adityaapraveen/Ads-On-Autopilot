import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port: process.env.PORT || 3001,
    openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        model: 'meta-llama/llama-3.3-70b-instruct:free'
    },
    db: {
        connectionString: process.env.DATABASE_URL,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
}