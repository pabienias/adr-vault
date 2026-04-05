import env from '@fastify/env';
import fp from 'fastify-plugin';

const schema = {
	type: 'object',
	required: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'],
	properties: {
		PORT: { type: 'number', default: 3001 },
		SUPABASE_URL: { type: 'string' },
		SUPABASE_SERVICE_ROLE_KEY: { type: 'string' },
		JWT_SECRET: { type: 'string' },
	},
} as const;

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			PORT: number;
			SUPABASE_URL: string;
			SUPABASE_SERVICE_ROLE_KEY: string;
			JWT_SECRET: string;
		};
	}
}

export default fp(
	async (fastify) => {
		await fastify.register(env, { schema, dotenv: true });
	},
	{ name: 'env' },
);
