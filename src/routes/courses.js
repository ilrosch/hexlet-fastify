import sanitize from 'sanitize-html';
import yup from 'yup';

const state = {
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
  ],
};

export default (app) => {
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

  app.get('/courses', { name: 'courses' }, (req, res) => {
    const title = sanitize(req.query.title);
    const desc = sanitize(req.query.desc);

    let courses = state.courses;
    if (title !== null) {
      const reg = new RegExp(`.*${title}.*`, 'i');
      courses = courses.filter(({ title }) => reg.exec(title));
    }

    if (desc !== null) {
      const reg = new RegExp(`.*${desc}.*`, 'i');
      courses = courses.filter(({ description }) => reg.exec(description));
    }

    res.view('src/views/courses/index', { courses });
  });

  app.get('/courses/new', { name: 'addCourse' }, (req, res) => res.view('src/views/courses/new', { course: {} }));

  app.get('/courses/:id', { name: 'course' }, (req, res) => {
    const courseId = parseInt(sanitize(req.params.id));
    const course = state.courses.find(({ id }) => id === courseId);

    if (!course) {
      res.code(404).send('Course not found');
      return;
    }

    res.view('src/views/courses/show', { course })
  });

  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const courseId = parseInt(sanitize(req.params.id));
    const course = state.courses.find(({ id }) => id === courseId);

    if (!course) {
      res.code(404).send('Course not found');
      return;
    }

    res.view('src/views/courses/edit', { course })
  });

  app.post('/courses', validator, (req, res) => {
    const { title, description } = req.body;

    if (req.validationError) {
      const data = {
        course: {
          title,
          description
        },

        error: req.validationError,
      };

      res.view('src/views/courses/new', data);
      return;
    }

    const course = {
      title,
      description,
    };

    state.courses.push(course);

    res.redirect(app.reverse('courses'));
  });

  app.post('/courses/:id', { name: 'rmCourse' }, (req, res) => {
    const courseId = parseInt(sanitize(req.params.id));
    const courseIndex = state.courses.findIndex(({ id }) => id === courseId);
    if (courseIndex === -1) {
      res.code(404).send('Course not found');
    } else {
      state.courses.splice(courseIndex, 1);
      res.redirect(app.reverse('courses'));
    }
  });

  app.post('/courses/:id/edit', validator, (req, res) => {
    const courseId = parseInt(sanitize(req.params.id));
    const { title, description } = req.body;

    if (req.validationError) {
      const data = {
        course: {
          title,
          description,
          id: courseId
        },

        error: req.validationError,
      };

      res.view('src/views/courses/edit', data);
      return;
    }

    const courseIndex = state.courses.findIndex(({ id }) => id === courseId);
    const course = {
      title,
      description,
    };

    state.courses[courseIndex] = { ...state.courses[courseIndex], ...course };

    res.redirect(app.reverse('courses'));
  });
};
