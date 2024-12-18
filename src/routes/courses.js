import sanitize from 'sanitize-html';
import yup from 'yup';

export default (app, db) => {
  // Валидатор полей
  const validator = {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().trim().min(2, 'Название должно быть не меньше двух символов'),
        description: yup.string().trim().min(10, 'Описание должно быть не меньше десяти символов'),
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

  // Страница со списком всех курсов
  app.get('/courses', { name: 'courses' }, (req, res) => {
    const title = sanitize(req.query.title).toLowerCase();
    const desc = sanitize(req.query.desc).toLowerCase();

    const querys = {
      all: 'SELECT * FROM courses',
      allFilters: `SELECT * FROM courses WHERE title LIKE "%${title}%" && description LIKE "%${desc}%"`,
      title: `SELECT * FROM courses WHERE title LIKE "%${title}%"`,
      desc: `SELECT * FROM courses WHERE description LIKE "%${desc}%"`,
    };

    let query;
    if (!title && !desc) {
      query = querys.all;
    } else if (title && desc) {
      query = querys.allFilters;
    } else if (title) {
      query = querys.title;
    } else {
      query = querys.desc;
    }

    db.all(query, (error, courses) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Ошибка получения списка курсов' });
        res.redirect(app.reverse('courses'));
        return;
      }
      res.view('courses/index', { courses, flash: res.flash() });
    });
  });

  // Страница создания нового курса
  app.get('/courses/new', { name: 'addCourse' }, (req, res) => {
    res.view('courses/new', { flash: res.flash() });
  });

  // Страница курса
  app.get('/courses/:id', { name: 'course' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `SELECT * FROM courses WHERE id = ${id}`;
    db.get(query, (error, course) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Курс не найден' });
        res.redirect(app.reverse('courses'));
        return;
      }
      res.view('courses/show', { course });
    });
  });

  // Страница редактирования курса
  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `SELECT * FROM courses WHERE id = ${id}`;
    db.get(query, (error, course) => {
      if (error) {
        console.error(error);
        req.flash('error', { type: 'danger', message: 'Курс не найден' });
        res.redirect(app.reverse('courses'));
        return;
      }
      res.view('courses/edit', { course });
    });
  });

  // Создание курса
  app.post('/courses', validator, (req, res) => {
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash('error', { type: 'danger', message: req.validationError.message });

      const data = {
        course: {
          title,
          description
        },

        flash: res.flash(),
      };

      res.view('courses/new', data);
      return;
    }

    const course = {
      title,
      description,
    };

    const query = `INSERT INTO courses (title, description) VALUES ("${title}", "${description}")`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.view('courses/new', { course, flash: res.flash() });
        return;
      }
      req.flash('success', { type: 'success', message: 'Курс успешно создан' });
      res.redirect(app.reverse('courses'));
    });
  });

  // Удаление курса
  app.post('/courses/:id', { name: 'rmCourse' }, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const query = `DELETE FROM courses WHERE id = ${id}`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.redirect(app.reverse('courses'));
        return;
      }
      req.flash('success', { type: 'success', message: 'Курс успешно удален' });
      res.redirect(app.reverse('courses'));
    });
  });

  // Редактирование курса
  app.post('/courses/:id/edit', validator, (req, res) => {
    const id = parseInt(sanitize(req.params.id));
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash('error', { type: 'danger', message: req.validationError.message });

      const data = {
        course: {
          title,
          description,
          id,
        },

        flash: res.flash(),
      };

      res.view('courses/edit', data);
      return;
    }

    const course = {
      title,
      description,
    };

    const query = `UPDATE courses SET title = "${title}", description = "${description}" WHERE id = ${id}`;
    db.run(query, (error) => {
      if (error) {
        console.error(error);
        req.flash('warning', { type: 'warning', message: 'Ошибка сервера' });
        res.view('courses/edit', { course, flash: res.flash() });
        return;
      }
      req.flash('success', { type: 'success', message: 'Курс успешно обновлен' });
      res.redirect(app.reverse('courses'));
    });
  });
};
