export default (app) => {
  app.get('/', (req, res) => {
    const { username } = req.session;
    res.view('index', { username, flash: res.flash() });
  });
};
