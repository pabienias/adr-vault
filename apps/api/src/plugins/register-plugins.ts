import type { FastifyInstance } from 'fastify';
import corsPlugin from './cors.js';
import envPlugin from './env.js';
import sensiblePlugin from './sensible.js';

export async function registerPlugins(app: FastifyInstance): Promise<void> {
	await app.register(envPlugin);
	await app.register(corsPlugin);
	await app.register(sensiblePlugin);
}
