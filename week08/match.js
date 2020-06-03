/**
 * @description 元素是否匹配选择器
 * @param {String} selector 
 * @param {Element} element 
 * @return {Boolean}
 */
function match(selector, element) {
  if (!selector || !element) {
    return false;
  }

  var current = element;
  var selectorParts = selector.split(' ').reverse();
  var isFirstMatch = _match(selectorParts[0], current);
  if (!isFirstMatch) {
    return false;
  } else {
    current = current.parentElement;
  }

  var matchCount = 1;
  while (current) {
    if (_match(selectorParts[matchCount], current)) {
      matchCount++;
    }
    current = current.parentElement;
  }
  return matchCount >= selectorParts.length;
}

/**
 * @description 元素是否匹配单个选择器
 * @param {String} selector 
 * @param {Element} element 
 * @return {Boolean}
 */
function _match(selector, element) {
  var temp = selector.slice();
  var ids = selector.match(/#([^\.#:]+)/);
  var classes = selector.match(/\.([^\.#:]+)/);

  if (ids && ids[1]) {
    if (element.id !== ids[1]) {
      return false;
    } else {
      temp = temp.replace(ids[0], "");
    }
  }

  if (classes && classes[1]) {
    if (!element.classList.contains(classes[1])) {
      return false;
    } else {
      temp = temp.replace(classes[0], "");
    }
  }
 
  if (temp === "" || element.tagName.toLowerCase() === temp.toLowerCase()) {
    return true;
  }
  
  return false;
}

match("div #id.class", document.getElementById("id"));