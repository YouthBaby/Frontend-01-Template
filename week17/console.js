var tty = require("tty");
var ttys = require("ttys");
var readline = require("readline");

var stdin = ttys.stdin;
var stdout = ttys.stdout;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding("utf8");

function up(n = 1) {
  stdout.write('\033[' + n + 'A');
}

function down(n = 1) {
  stdout.write('\033[' + n + 'B');
}

function right(n = 1) {
  stdout.write('\033[' + n + 'C');
}

function left(n = 1) {
  stdout.write('\033[' + n + 'D');
}

function getChar() {
  return new Promise((resolve) => {
    stdin.once("data", key => {
      resolve(key);
    });
  });
}

void async function() {
  await select(["Vue", "React", "Angular"]);
}()

async function select(choices) {
  let selected = 0;
  for (let i = 0; i < choices.length; i++) {
    if (i === selected) {
      stdout.write("[x]" + choices[i] + "\n");
    } else {
      stdout.write("[ ]" + choices[i] + "\n");
    }
  }
  up(choices.length);
  right();

  while (true) {
    let char = await getChar();
    if (char === "\u0003") {
      process.exit();
    }
    if (char === "w" && selected > 0) {
      stdout.write(" ");
      left();
      selected--;
      up();
      stdout.write("x");
      left();
    }
    if (char === "s" && selected < choices.length - 1) {
      stdout.write(" ");
      left();
      selected++;
      down();
      stdout.write("x");
      left();
    }
  }
}
