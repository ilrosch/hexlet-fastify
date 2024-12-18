import getApp from "../src/index.js";

const app = await getApp();
const port = process.env.PORT || 10000;


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});