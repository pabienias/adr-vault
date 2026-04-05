import cors from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(
	async (fastify) => {
		await fastify.register(cors, {
			origin: 'http://localhost:3000',
		});
	},
	{ name: 'cors' },
);
