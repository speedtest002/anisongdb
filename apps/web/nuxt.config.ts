// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    // Deploy to Cloudflare Pages
    nitro: {
        preset: 'cloudflare_pages',
    },

    // TypeScript configuration
    typescript: {
        strict: true,
    },
})
