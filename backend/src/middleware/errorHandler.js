import { AppError, ValidationError } from '../lib/errors.js';

export const errorHandler = (err, req, res, next) => {
    // Log every error server-side with context
    console.error({
        message: err.message,
        code: err.code,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Zod validation errors
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: {
                code: err.code,
                message: err.message,
                fields: err.errors,
            },
        });
    }

    // Known operational errors (NotFound, AppError, etc.)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }

    // PostgreSQL errors
    if (err.code === '22P02') {
        return res.status(400).json({
            error: { code: 'INVALID_UUID', message: 'Invalid ID format' },
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            error: { code: 'FOREIGN_KEY_VIOLATION', message: 'Referenced record does not exist' },
        });
    }

    // Unexpected — never expose internals in production
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong'
                : err.message,
        },
    });
};