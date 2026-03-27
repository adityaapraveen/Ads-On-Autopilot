import { createClient } from 'redis'
import { config } from '../config/index.js'

export const redis = createClient({ url: config.redis.url })

redis.on('error', (err) => console.error('Redis error: ', err))

export const connectRedis = async () => {
    await redis.connect()
    console.log('Redis connection successful')
}