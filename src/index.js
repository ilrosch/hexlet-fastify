import fastify from 'fastify';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';

import addRoutes from './routes/index.js';


export default async () => {
  const app = fastify({ exposeHeadRoutes: false });

  await app.register(fastifyReverseRoutes);
  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route: (name, placeholdersValues) => app.reverse(name, placeholdersValues),
    },
  });
  await app.register(formbody);

  addRoutes(app);

  return app;
};
