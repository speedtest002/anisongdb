import type { MiddlewareHandler } from 'hono';

/**
 * Simple validation middleware without external dependencies
 * For more complex validation, consider using @hono/zod-validator with Zod
 */

type ValidationSchema<T> = {
    [K in keyof T]: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required?: boolean;
        min?: number;
        max?: number;
        validate?: (value: T[K]) => boolean;
    };
};

/**
 * Validate JSON body against a simple schema
 */
export const validateJson = <T extends Record<string, unknown>>(
    schema: ValidationSchema<T>,
): MiddlewareHandler => {
    return async (c, next) => {
        try {
            const body = await c.req.json();
            const errors: string[] = [];

            for (const [key, rules] of Object.entries(schema)) {
                const value = body[key];

                // Check required
                if (rules.required && (value === undefined || value === null)) {
                    errors.push(`${key} is required`);
                    continue;
                }

                // Skip validation if not required and not present
                if (value === undefined || value === null) {
                    continue;
                }

                // Check type
                const actualType = Array.isArray(value)
                    ? 'array'
                    : typeof value;
                if (actualType !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                    continue;
                }

                // Check min/max for strings and arrays
                if (rules.type === 'string' && typeof value === 'string') {
                    if (rules.min !== undefined && value.length < rules.min) {
                        errors.push(
                            `${key} must be at least ${rules.min} characters`,
                        );
                    }
                    if (rules.max !== undefined && value.length > rules.max) {
                        errors.push(
                            `${key} must be at most ${rules.max} characters`,
                        );
                    }
                }

                // Check min/max for numbers
                if (rules.type === 'number' && typeof value === 'number') {
                    if (rules.min !== undefined && value < rules.min) {
                        errors.push(`${key} must be at least ${rules.min}`);
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        errors.push(`${key} must be at most ${rules.max}`);
                    }
                }

                // Custom validation
                if (rules.validate && !rules.validate(value as T[keyof T])) {
                    errors.push(`${key} failed custom validation`);
                }
            }

            if (errors.length > 0) {
                return c.json(
                    {
                        success: false,
                        error: 'Validation failed',
                        details: errors,
                    },
                    400,
                );
            }

            await next();
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid JSON body',
                },
                400,
            );
        }
    };
};

/**
 * Validate query parameters
 */
export const validateQuery = (
    rules: Record<
        string,
        {
            type: 'string' | 'number';
            required?: boolean;
            min?: number;
            max?: number;
        }
    >,
): MiddlewareHandler => {
    return async (c, next) => {
        const errors: string[] = [];

        for (const [key, rule] of Object.entries(rules)) {
            const value = c.req.query(key);

            // Check required
            if (rule.required && !value) {
                errors.push(`Query parameter '${key}' is required`);
                continue;
            }

            // Skip if not required and not present
            if (!value) continue;

            // Validate number type
            if (rule.type === 'number') {
                const num = Number(value);
                if (isNaN(num)) {
                    errors.push(`Query parameter '${key}' must be a number`);
                    continue;
                }
                if (rule.min !== undefined && num < rule.min) {
                    errors.push(
                        `Query parameter '${key}' must be at least ${rule.min}`,
                    );
                }
                if (rule.max !== undefined && num > rule.max) {
                    errors.push(
                        `Query parameter '${key}' must be at most ${rule.max}`,
                    );
                }
            }

            // Validate string length
            if (rule.type === 'string') {
                if (rule.min !== undefined && value.length < rule.min) {
                    errors.push(
                        `Query parameter '${key}' must be at least ${rule.min} characters`,
                    );
                }
                if (rule.max !== undefined && value.length > rule.max) {
                    errors.push(
                        `Query parameter '${key}' must be at most ${rule.max} characters`,
                    );
                }
            }
        }

        if (errors.length > 0) {
            return c.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                },
                400,
            );
        }

        await next();
    };
};
