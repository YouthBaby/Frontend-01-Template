import { parseHTML } from "../src/parser";
const assert = require("assert");

it("parse a single element", () => {
  let doc = parseHTML("<div></div>");
  let div = doc.children[0];
  assert.equal(div.tagName, "div");
  assert.equal(div.children.length, 0);
  assert.equal(div.type, "element");
  assert.equal(div.attributes.length, 2);
});

it("parse a single element with text content", () => {
  let doc = parseHTML("<div>hello</div>");
  let text = doc.children[0].children[0];
  assert.equal(text.content, "hello");
  assert.equal(text.type, "text");
});

it("tag mismatch", () => {
  try {
    parseHTML("<div>hello</vid>");
  } catch (error) {
    assert.equal(error.message, "Tag start end doesn't match!");
  }
});

it("text with <", () => {
  let doc = parseHTML("<div>a < b</div>");
  let text = doc.children[0].children[0];
  assert.equal(text.content, "a < b");
  assert.equal(text.type, "text");
});

it("with property", () => {
  let doc = parseHTML("<div id=a class='cls' data=\"abc\" ></div>");
  let div = doc.children[0];
  let count = 0;
  for (let attr of div.attributes) {
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++
      assert.equal(attr.value, "a");
    }
  }
  assert.ok(count === 3);
});

it("with property 2", () => {
  let doc = parseHTML("<div id=a class='cls' data=\"abc\"></div>");
  let div = doc.children[0];
  let count = 0;
  for (let attr of div.attributes) {
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++
      assert.equal(attr.value, "a");
    }
  }
  assert.ok(count === 3);
});

it("with property 3", () => {
  let doc = parseHTML("<div id=a class='cls' data=\"abc\"/>");
  let div = doc.children[0];
  let count = 0;
  for (let attr of div.attributes) {
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++;
      assert.equal(attr.value, "a");
    }
    if (attr.name === "id") {
      count++
      assert.equal(attr.value, "a");
    }
  }
  assert.ok(count === 3);
});

it("script", () => {
  let content = `
  <div>abcd</div>
  <span>x</span>
  /script
  <script
  <
  </
  </s
  </sc
  </scr
  </scri
  </scrip
  </script `
  let doc = parseHTML(`<script>${content}</script>`);
  let text = doc.children[0].children[0];
  assert.equal(text.content, content);
  assert.equal(text.type, "text");
});

it("attribute with no value", () => {
  let doc = parseHTML("<div class />");
});

it("self closing tag", () => {
  let doc = parseHTML("<div/>");
});

it("attribute with no value", () => {
  let doc = parseHTML("<div  />");
});

it("attribute with no value", () => {
  let doc = parseHTML("<DIV class = a>/>");
});

it("attribute with no value", () => {
  let doc = parseHTML("<DIV class=a/>");
});

it("attribute with no value", () => {
  let doc = parseHTML("<div class id/>");
});

it("attribute with no value", () => {
  let doc = parseHTML(`<div></>`);
});

it("attribute with no value", () => {
  let doc = parseHTML(`<div class='a'c=v></div>`);
});