import fastify from 'fastify';

const app = fastify();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/hello', (req, res) => {
  const firstName = req.query.name || 'World';
  res.send(`Hello, ${firstName}!`);
});

app.get('/courses/:id', (req, res) => {
  res.send(`Course ID: ${req.params.id}`);
});

app.get('/users', (req, res) => {
  res.send('GET /users');
});

app.get('/users/:id/post/:postId', (req, res) => {
  res.send(`USER ID: ${req.params.id}, POST ID: ${req.params.postId}`);
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});