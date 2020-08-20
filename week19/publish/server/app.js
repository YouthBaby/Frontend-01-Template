const path = require("path");
const Koa = require("koa");
const static = require("koa-static");

const app = new Koa();

app.use(static(
  path.resolve(__dirname, "public")
));

app.listen(80, () => {
  console.log('listening at http://192.168.31.60');
});
