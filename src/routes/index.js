import root from "./root.js";
import courses from "./courses.js";
import users from "./users.js";
import sessions from "./sessions.js";

const controllers = [
  courses,
  users,
  root,
  sessions
];

export default (app, db) => controllers.forEach((f) => f(app, db));
