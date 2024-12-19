import getApp from "../src/index.js";

const app = await getApp();
const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? '0.0.0.0' : 'localhost';

app.listen({ port, host }, () => {
  console.log(`Example app listening on port ${port}`);
});