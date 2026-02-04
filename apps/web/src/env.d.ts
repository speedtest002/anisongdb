/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
    CLERK_SECRET_KEY: string;
    // Add other environment variables here
}

declare namespace App {
    interface Locals extends Runtime {}
}
