import sanitize from 'sanitize-html';
import yup from 'yup';

export default (app, db) => {
  // Валидтор полей
  const validator = {
    attachValidation: true,
    schema: {
      body: yup.object({
        firstName: yup.string().trim().min(2, 'Имя должно быть не меньше двух символов'),
        lastName: yup.string().trim().min(2, 'Фамилия должна быть не меньше двух символов'),
        email: yup.string().trim().email(),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  };

  // Страница со списком пользователей
  app.get('/users', { name: 'users' }, (req, res) => {
    const query = 'SELECT * FROM users';
    db.all(query, (error, users) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Ошибка получения списка пользователей' });
        res.redirect(app.reverse('users'));
        return;
      }
      res.view('users/index', { users, flash: res.flash() });
    });
  });

  // Страница создания нового пользовтеля
  app.get('/users/new', { name: 'addUser' }, (req, res) => {
    res.view('users/new', { flash: res.flash() });
  });

  // Страница пользователя
  app.get('/users/:id', { name: 'user' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `SELECT * FROM users WHERE id = ${id}`;
    db.get(query, (error, user) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Пользователь не найден' });
        res.redirect(app.reverse('users'));
        return;
      }
      res.view('users/show', { user });
    });
  });

  // Страница редактирования пользователя
  app.get('/users/:id/edit', { name: 'editUser' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `SELECT * FROM users WHERE id = ${id}`;
    db.get(query, (error, user) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Пользователь не найден' });
        res.redirect(app.reverse('users'));
        return;
      }
      res.view('users/edit', { user });
    });
  });

  // Добавление пользователя
  app.post('/users', validator, (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (req.validationError) {
      req.flash('error', { type: 'danger', message: req.validationError.message });

      const data = {
        user: {
          firstName,
          lastName,
          email,
        },
        flash: res.flash(),
      };

      res.view('users/new', data);
      return;
    }

    const user = {
      firstName,
      lastName,
      email,
    };

    const query = `INSERT INTO users (firstName, lastName, email) VALUES ("${firstName}", "${lastName}", "${email}")`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.view('users/new', { user, flash: res.flash() });
        return;
      }
      req.flash('success', { type: 'success', message: 'Пользователь успешно создан' });
      res.redirect(app.reverse('users'));
    });
  });

  // Удаление пользователя
  app.post('/users/:id', { name: 'rmUser' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `DELETE FROM users WHERE id = ${id}`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.redirect(app.reverse('users'));
        return;
      }
      req.flash('success', { type: 'success', message: 'Пользователь успешно удален' });
      res.redirect(app.reverse('users'));
    });
  });

  // Редактирование пользователя
  app.post('/users/:id/edit', validator, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const { firstName, lastName, email } = req.body;

    if (req.validationError) {
      const data = {
        user: {
          firstName,
          lastName,
          email,
          id: userId
        },

        error: req.validationError,
      };

      res.view('users/edit', data);
      return;
    }

    const user = {
      firstName,
      lastName,
      email,
    };

    const query = `UPDATE users SET firstName = "${firstName}", lastName = "${lastName}", email = "${email}" WHERE id = ${id}`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.view('users/edit', { user, flash: res.flash() });
        return;
      }
      req.flash('success', { type: 'success', message: 'Пользователь успешно обновлен' });
      res.redirect(app.reverse('users'));
    });
  });
};
