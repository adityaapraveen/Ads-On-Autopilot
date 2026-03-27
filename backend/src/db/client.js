import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: config.db.connectionString,
    ssl: isProduction ? { rejectUnauthorized: true } : false,
});

pool.on('connect', () => console.log('PostgreSQL connected'));
pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
    process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);