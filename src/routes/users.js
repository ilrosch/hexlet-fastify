import sanitize from 'sanitize-html';
import yup from 'yup';

const state = {
  users: [
    {
      id: 1,
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'ivanov@mail.ru'
    },
  ],
};

export default (app) => {
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

  app.get('/users', { name: 'users' }, (req, res) => {
    res.view('src/views/users/index', { users: state.users })
  });

  app.get('/users/new', { name: 'addUser' }, (req, res) => {
    res.view('src/views/users/new', { user: {} })
  });

  app.get('/users/:id', { name: 'user' }, (req, res) => {
    const userId = parseInt(sanitize(req.params.id));
    const user = state.users.find(({ id }) => id === userId);

    if (!user) {
      res.code(404).send('User not found');
      return;
    }

    res.view('src/views/users/show', { user })
  });

  app.get('/users/:id/edit', { name: 'editUser' }, (req, res) => {
    const userId = parseInt(sanitize(req.params.id));
    const user = state.users.find(({ id }) => id === userId);

    if (!user) {
      res.code(404).send('Course not found');
      return;
    }

    res.view('src/views/users/edit', { user })
  });

  app.post('/users', validator, (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (req.validationError) {
      const data = {
        user: {
          firstName,
          lastName,
          email,
        },

        error: req.validationError,
      };

      res.view('src/views/users/new', data);
      return;
    }

    const user = {
      firstName,
      lastName,
      email,
    };

    state.users.push(user);

    res.redirect(app.reverse('users'));
  });

  app.post('/users/:id', { name: 'rmUser' }, (req, res) => {
    const userId = parseInt(sanitize(req.params.id));
    const userIndex = state.users.findIndex(({ id }) => id === userId);
    if (userIndex === -1) {
      res.code(404).send('User not found');
    } else {
      state.users.splice(userIndex, 1);
      res.redirect(app.reverse('users'));
    }
  });

  app.post('/users/:id/edit', validator, (req, res) => {
    const userId = parseInt(sanitize(req.params.id));
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

      res.view('src/views/users/edit', data);
      return;
    }

    const userIndex = state.users.findIndex(({ id }) => id === userId);
    const user = {
      firstName,
      lastName,
      email,
    };

    state.users[userIndex] = { ...state.users[userIndex], ...user };

    res.redirect(app.reverse('users'));
  });
};
