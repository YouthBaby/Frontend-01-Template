const unzipper = require("unzipper");
const Router = require("@koa/router");

const router = new Router();

router.post("/", async(ctx, next) => {
  const writeStream = unzipper.Extract({
    path: "../server/public/"
  });
  ctx.respond = false;
  ctx.req.pipe(writeStream);
  ctx.req.once("end", () => {
    ctx.res.end();
  });
});

module.exports = router;
