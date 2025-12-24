import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Global error handler middleware
 * Handles various error types with appropriate responses
 */
export const errorHandler: ErrorHandler = (err, c) => {
    console.error('Unhandled error:', err);

    // Handle Hono HTTP exceptions
    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                error: err.message,
            },
            err.status,
        );
    }

    // Check if it's a D1 database error
    if (err.message?.includes('D1_ERROR')) {
        return c.json(
            {
                success: false,
                error: 'Database error',
                // Note: In production, consider hiding detailed error messages
            },
            500,
        );
    }

    // Check if it's a FTS5 syntax error
    if (
        err.message?.includes('fts5') ||
        err.message?.includes('MATCH') ||
        err.message?.includes('syntax error')
    ) {
        return c.json(
            {
                success: false,
                error: 'Invalid search query',
                details: 'Please check your search syntax',
            },
            400,
        );
    }

    // Check if it's a validation error (from Zod or custom)
    if (err.name === 'ZodError' || err.message?.includes('Validation')) {
        return c.json(
            {
                success: false,
                error: 'Validation error',
                details: err.message,
            },
            400,
        );
    }

    // Generic error response
    return c.json(
        {
            success: false,
            error: err.message || 'Internal server error',
        },
        500,
    );
};
