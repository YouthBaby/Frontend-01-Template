var decimalRegExp = /^0\.\d*(?:[eE][+-]?\d+)?$|^[1-9]\.\d*(?:[eE][+-]?\d+)?$|^\.\d+(?:[eE][+-]?\d+)?$|^0(?:[eE][+-]?\d+)?$|^[1-9]\d*(?:[eE][+-]?\d+)?$/
var binaryRegExp = /^0[bB]([01]+)$/
var octalRegExp = /^0[oO]([0-7]+)$/
var hexRegExp = /^0[xX]([0-9a-fA-F]+)$/

/**
 * @param {string} char
 * @return {number}
 */
function getValue(char) {
  return /^\d$/.test(char) ? char.codePointAt(0) - 48 : char.codePointAt(0) - 39 - 48;
}

/**
 * @param {string} string
 * @param {number} radix 进制
 * @return {number}
 */
function computeValue(string, radix) {
  var i = 0,
      number = 0,
      fraction = 1,
      fractionCount = 0,
      strArr = string.toLowerCase().split('e'),
      chars = strArr[0].split(''),
      expos = strArr[1];
  while (i < chars.length && chars[i] !== '.') {
    number *= radix;
    number += getValue(chars[i++]);
  }
  if (chars[i] === '.') {
    i++;
  }
  while (i < chars.length) {
    fractionCount++;
    fraction = fraction / radix;
    number += getValue(chars[i++]) * fraction;
  }
  if (expos) {
    var expo;
    number = Math.floor(number * Math.pow(10, fractionCount));
    if (expos[0] === '-') {
      expo = -1 * computeValue(expos.slice(1), 10);
    } else {
      var start = expos[0] === '+' ? 1 : 0;
      expo = computeValue(expos.slice(start), 10);
    }
    number = number * Math.pow(10, expo - fractionCount);
  }
  return number
}

/**
 * @param {string} string
 * @param {number} radix 进制
 * @return {number}
 */
function convertStringToNumber(string, radix = 10) {
  if ((_b = string.match(binaryRegExp)) && _b[1]) {
    return computeValue(_b[1], 2);
  }
  if ((_o = string.match(octalRegExp)) && _o[1]) {
    return computeValue(_o[1], 8);
  }
  if ((_h = string.match(hexRegExp)) && _h[1]) {
    return computeValue(_h[1], 16);
  }
  if (string.match(decimalRegExp) === null) {
    return NaN;
  }
  return computeValue(string, radix);
}

// 0.56
// 0.56e+3
// 0.56e-3
// 0.e3

// .5e+3
// .5e-3
// .5e3

// 0e+3、5e+3