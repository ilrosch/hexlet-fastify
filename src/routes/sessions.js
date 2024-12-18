import sanitize from "sanitize-html";

export default (app, db) => {
  // Страница авторизации (начала сессии)
  app.get('/sessions/new', { name: 'session' }, (req, res) => {
    res.view('users/session', { flash: res.flash() });
  });

  // Создание новой сессии
  app.post('/sessions/new', (req, res) => {
    const login = sanitize(req.body.login);
    const query = `SELECT * FROM users WHERE email = "${login}"`;
    db.get(query, (error, user) => {
      if (error || !user) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Пользователь не найден' });
        res.redirect(app.reverse('session'));
        return;
      }

      req.flash('success', { type: 'success', message: 'Пользователь авторизован' });
      req.session.username = user.firstName;
      res.redirect('/');
    });
  });

  // Завершение сессии
  app.post('/sessions/delete', { name: 'rmSession' }, (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.redirect('/');
    });
  });
};
