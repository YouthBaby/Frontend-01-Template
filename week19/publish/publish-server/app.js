const Koa = require("koa");
const router = require("./routes");

const app = new Koa();

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080, () => {
  console.log('listening at http://192.168.31.60:8080');
});
