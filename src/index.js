import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import fastify from 'fastify';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import flash from '@fastify/flash';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import pug from 'pug';

import addRoutes from './routes/index.js';


export default async () => {
  const __dirname = fileURLToPath(path.dirname(import.meta.url));
  const app = fastify({ exposeHeadRoutes: false, logger: true });

  const db = new sqlite3.Database(':memory:');
  const prepareDatabase = () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE courses (
          id integer PRIMARY KEY AUTOINCREMENT,
          title varchar(255) NOT NULL,
          description text NOT NULL
        );  
      `);
      db.run(`
        CREATE TABLE users (
          id integer PRIMARY KEY AUTOINCREMENT,
          firstName varchar(255) NOT NULL,
          lastName varchar(255) NOT NULL,
          email varchar(255) NOT NULL
        );  
      `);
    });

    const courses = [
      { id: 1, title: 'JavaScript', description: 'Курс по языку программирования JavaScript' },
      { id: 2, title: 'Fastify', description: 'Курс по фреймворку Fastify' },
    ];

    const stmtCourses = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)');

    courses.forEach(({ title, description }) => {
      stmtCourses.run(title, description);
    });

    stmtCourses.finalize();

    const users = [
      { id: 1, firstName: 'Иван', lastName: 'Иванов', email: 'ivanov@mail.ru' },
      { id: 2, firstName: 'Александр', lastName: 'Петров', email: 'apetrov@mail.ru' },
    ];

    const stmtUsers = db.prepare('INSERT INTO users (firstName, lastName, email) VALUES (?, ?, ?)');

    users.forEach(({ firstName, lastName, email }) => {
      stmtUsers.run(firstName, lastName, email);
    });

    stmtUsers.finalize();
  };

  prepareDatabase();

  await app.register(fastifyReverseRoutes);
  await app.register(view, {
    engine: { pug },
    templates: path.join(__dirname, 'views'),
    defaultContext: {
      route: (name, placeholdersValues) => app.reverse(name, placeholdersValues),
    },
  });
  await app.register(formbody);
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
  });
  await app.register(flash);

  addRoutes(app, db);

  return app;
};
