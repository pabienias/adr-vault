import Fastify from 'fastify';
import { registerPlugins } from './plugins/index.js';

export async function buildApp(): Promise<ReturnType<typeof Fastify>> {
	const app = Fastify({ logger: true });

	await registerPlugins(app);

	app.get('/health', async () => ({ status: 'ok' }));

	return app;
}
