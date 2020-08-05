var path = require("path");
var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }
  async promting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "title",
        message: "Your project title"
      }
    ]);
  }
  writing() {
    this.fs.copyTpl(
      this.templatePath(path.resolve(__dirname, "../templates", "index.html")),
      this.destinationPath(path.resolve(__dirname, "../../public", "index.html")),
      {
        title: this.answers.title
      }
    )
  }
};
