export default (app) => {
  app.get('/', (req, res) => res.view('src/views/index'));
};
