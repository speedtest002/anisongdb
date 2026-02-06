import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv } from './types.js';
import pkg from '../package.json';

// Middleware
import {
    databaseMiddleware,
    errorHandler,
    requestLogger,
} from './middleware/index.js';

// Routes
import { songRoutes, animeRoutes, artistRoutes, playlistRoutes } from './routes/index.js';

const app = new Hono<AppEnv>();

app.onError(errorHandler);
app.use('*', cors());
app.use('*', requestLogger);
app.use('*', databaseMiddleware);

app.get('/api', (c) => {
    return c.json({
        message: `${pkg.name} is running`,
        version: pkg.version,
    });
});

// routes
app.route('/api/song', songRoutes);
app.route('/api/anime', animeRoutes);
app.route('/api/artist', artistRoutes);
app.route('/api/playlist', playlistRoutes);

export default app;
