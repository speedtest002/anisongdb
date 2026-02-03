/**
 * Middleware exports
 * Import all middleware from this file for convenience
 */

// Database
export { databaseMiddleware, databaseMiddlewareWithLogging } from './database';

// Error handling
export { errorHandler } from './error-handler';

// Logging & Timing
export { requestLogger, requestTiming } from './logger';

// Caching
export { cacheControl, dailyCache, noCache } from './cache';

// Security
export { securityHeaders, customCors } from './security';

// Validation
export { validateJson, validateQuery } from './validation';
