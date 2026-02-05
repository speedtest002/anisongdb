export interface ApiErrorResponse {
    error: string;
    message?: string;
    status?: number;
}

export type ApiResponse<T> = T | ApiErrorResponse;
