import root from "./root.js";
import courses from "./courses.js";
import users from "./users.js";

const controllers = [
  root,
  courses,
  users,
];

export default (app) => controllers.forEach((f) => f(app));
