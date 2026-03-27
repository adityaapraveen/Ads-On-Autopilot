import { Router } from 'express'
import { query } from '../db/client.js'
import { redis } from '../db/redis.js'

const healthRouter = Router()

healthRouter.get('/', async (req, res) => {
    try {
        await query('SELECT 1')
        await redis.ping()
        res.json({
            status: 'ok',
            postgres: 'connected',
            redis: 'connected',
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
        })
    }
})

export default healthRouter