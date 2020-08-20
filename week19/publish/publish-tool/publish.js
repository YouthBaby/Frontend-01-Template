const http = require("http");
const archiver = require("archiver");

const name = "./package";

const archive = archiver("zip", {
  zlib: {
    level: 9
  }
});

const req = http.request({
  host: "192.168.31.60",
  port: 8080,
  method: "POST",
  headers: {
    "Content-Type": "application/octet-stream"
  },
  path: `/?name=${name}.zip`
});

archive.directory(name, false);

archive.finalize();

archive.pipe(req);

archive.once("end", () => {
  req.end();
});
