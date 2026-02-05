import { ENV } from './env.js';
import { HttpError } from './httpError.js';

export async function fetcher<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${ENV.PUBLIC_API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        let body;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        throw new HttpError(response.status, response.statusText, body);
    }

    return response.json() as Promise<T>;
}
