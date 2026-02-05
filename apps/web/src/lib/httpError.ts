export class HttpError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body: any = null
    ) {
        super(`HTTP Error: ${status} ${statusText}`);
        this.name = 'HttpError';
    }
}
