export const ENV = {
    PUBLIC_API_URL: import.meta.env.PUBLIC_API_URL || 'http://localhost:8787/api',
} as const;
