const css = require('css');

let currentToken = null;
let currentAttribute = null;

let stack = [{ type: "document", children: []}];
let currentTextNode = null;

let rules = [];
function addCSSRules(text) {
  var ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
  if (!selector || !element.attributes) {
    return false;
  }

  var temp = selector.slice();
  var ids = selector.match(/#([^\.#:]+)/);
  var classes = selector.match(/\.([^\.#:]+)/);

  if (ids && ids[1]) {
    var attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (!attr || attr.value !== ids[1]) {
      return false
    } else {
      temp = temp.replace(ids[0], "");
    }
  }

  if (classes && classes[1]) {
    var attr = element.attributes.filter(attr => attr.name === 'class')[0];
    if (!attr || attr.value.split(" ").every(cls => cls !== classes[1])) {
      return false
    } else {
      temp = temp.replace(classes[0], "");
    }
  }
 
  if (temp === "" || element.tagName === temp) {
    return true;
  }
  
  return false;
}

function specificity(selector) {
  var p = [0, 0, 0, 0];
  var selectorParts = selector.split(" ");
  for (var part of selectorParts) {
    var count = 0;
    var ids = part.match(/#([^\.#]+)/);
    var classes = part.match(/\.([^\.#]+)/);
    if (ids && ids[1]) {
      p[1] += 1;
      count += ids[0].length;
    }
    if (classes && classes[1]) {
      p[2] += 1;
      count += classes[0].length;
    }
    if (part.length - count > 0) {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0])
    return sp1[0] - sp2[0];
  if (sp1[1] - sp2[1])
    return sp1[1] - sp2[1];
  if (sp1[2] - sp2[2])
    return sp1[2] - sp2[2];
  return sp1[3] - sp2[3];
}

function computeCSS(element) {
  var elements = stack.slice().reverse();

  if (!element.computedStyle) {
    element.computedStyle = {};
  }

  for (let rule of rules) {
    for (let selector of rule.selectors) {
      var selectorParts = selector.split(" ").reverse();
      if (!match(element, selectorParts[0])) continue;
  
      let matched = false;
      var j = 1;
      for (var i = 0; i < elements.length; i++) {
        if (match(elements[i], selectorParts[j])) {
          j++;
        }
      }
      if (j >= selectorParts.length) {
        matched = true;
      }
      if (matched) {
        var sp = specificity(selector);
        var computedStyle = element.computedStyle;
        for (var declaration of rule.declarations) {
          if (!computedStyle[declaration.property]) {
            computedStyle[declaration.property] = {};
          }
          if (!computedStyle[declaration.property].specificity) {
            computedStyle[declaration.property].value = declaration.value;
            computedStyle[declaration.property].specificity = sp;
          } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
            computedStyle[declaration.property].value = declaration.value;
            computedStyle[declaration.property].specificity = sp;
          }
        }
      }
    }
  }
}

function emit(token) {
  let top = stack[stack.length - 1];
  
  if (token.type === "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: []
    }

    element.tagName = token.tagName;

    for (let p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p]
        });
      }
    }

    computeCSS(element);

    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!")
    } else {
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type === "text") {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: ""
      }
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

const EOF = Symbol("EOF");

function data(c) {
  if (c === "&") {
    // Set the return state to the data state. 
    // return chacterReference;
  } else if (c === "<") {
    return tagOpen;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error.
    emit({
      type: "text",
      content: c
    });
    return;
  } else if (c === EOF) {
    emit({
      type: "EOF"
    });
    return;
  } else {
    emit({
      type: "text",
      content: c
    });
    return data;
  }
}

function tagOpen(c) {
  if (c === "!") {
    // return markupDeclarationOpen;
  } else if (c === "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: ""
    }
    return tagName(c);
  } else if( c === "?") {
    // This is an unexpected-question-mark-instead-of-tag-name parse error.?
    // Create a comment token whose data is the empty string. Reconsume in the bogus comment state.
  } else if (c === EOF) {
    // This is an eof-before-tag-name parse error.
    emit({
      type: "text",
      content: "U+003C LESS-THAN SIGN"
    });
    emit({
      type: "EOF"
    });
    return;
  } else {
    // This is an invalid-first-character-of-tag-name parse error.
    emit({
      type: "text",
      content: "U+003C LESS-THAN SIGN"
    });
    return data(c);
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: ""
    }
    return tagName(c);
  } else if (c === ">") {
    // This is a missing-end-tag-name parse error. 
    return data;
  } else if (c === EOF) {
    // This is an eof-before-tag-name parse error.
    emit({
      type: "text",
      content: "U+003C LESS-THAN SIGN"
    });
    emit({
      type: "text",
      content: "U+002F SOLIDUS"
    });
    emit({
      type: "EOF",
    });
    return;
  } else {
    // This is an invalid-first-character-of-tag-name parse error.
    // commentToken = {
    //   data: ""
    // }
    // return bogusComment(c);
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c.toLowerCase();
    return tagName;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error.
    currentToken.tagName += "U+FFFD REPLACEMENT CHARACTER"
  } else if (c === EOF) {
    // This is an eof-in-tag parse error.
    emit({
      type: "EOF"
    });
    return;
  } else {
    currentToken.tagName += c;
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/" || c === ">" || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "=") {
    // This is an unexpected-equals-sign-before-attribute-name parse error. 
    currentAttribute = {
      name: c,
      value: ""
    }
    return attributeName;
  } else {
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c);
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    return afterAttributeName(c);
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentAttribute.name += c.toLowerCase();
    return attributeName;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error.
    currentAttribute.name += "U+FFFD REPLACEMENT CHARACTER";
    return attributeName;
  } else if (c === "\"" || c === "\'" || c === "<") {
    // This is an unexpected-character-in-attribute-name parse error.
    currentAttribute.name += c;
    return attributeName;
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === "=") {
    return beforeAttributeValue;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    // This is an eof-in-tag parse error.
    emit({
      type: "EOF"
    });
    return;
  } else {
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c);
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeValue;
  } else if (c === "\"") {
    return doubleQuotedAttributeValue;
  } else if (c === "\'") {
    return singleQuotedAttributeValue;
  } else if (c === ">") {
    // This is a missing-attribute-value parse error.
    emit(currentToken);
    return data;
  } else {
    return UnquotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === "\"") {
    return afterQuotedAttributeValue;
  } else if (c === "&") {
    // Set the return state to the attribute value (double-quoted) state. 
    // return chacterReference;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error. 
    currentAttribute.value += "U+FFFD REPLACEMENT CHARACTER";
    return doubleQuotedAttributeValue;
  } else if (c === EOF) {
    // This is an eof-in-tag parse error. 
    emit({
      type: "EOF"
    });
    return;
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c === "\'") {
    return afterQuotedAttributeValue;
  } else if (c === "&") {
    // Set the return state to the attribute value (single-quoted) state. 
    // return chacterReference;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error. 
    currentAttribute.value += "U+FFFD REPLACEMENT CHARACTER";
    return singleQuotedAttributeValue;
  } else if (c === EOF) {
    // This is an eof-in-tag parse error. 
    emit({
      type: "EOF"
    });
    return;
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === "&") {
    // Set the return state to the attribute value (unquoted) state. 
    // return chacterReference;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === "\u0000") {
    // This is an unexpected-null-character parse error.
    currentAttribute.value += "U+FFFD REPLACEMENT CHARACTER";
    return UnquotedAttributeValue;
  } else if (c === "\"" || c === "\'" || c === "<" || c === "=" || c === "`") {
    // This is an unexpected-character-in-unquoted-attribute-value parse error. Treat it as per the "anything else" entry below.
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  } else if (c === EOF) {
    // This is an eof-in-tag parse error.
    emit({
      type: "EOF"
    });
    return;
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    // This is an eof-in-tag parse error.
    emit({
      type: "EOF"
    });
    return;
  } else {
    // This is a missing-whitespace-between-attributes parse error.
    return beforeAttributeName(c);
  }
}

function selfClosingStartTag(c) {
  if (c === ">") {
    currentToken.isSelfClosing = true;
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF ) {
    // This is an eof-in-tag parse error.
    emit({
      type: "EOF"
    });
    return;
  } else {
    // This is an unexpected-solidus-in-tag parse error.
    return beforeAttributeName(c);
  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
  return stack[0];
}
