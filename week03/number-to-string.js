var hexMap = {
  10: 'a',
  11: 'b',
  12: 'c',
  13: 'd',
  14: 'e',
  15: 'f',
}

/**
 * @param {number} number
 * @param {number} radix 进制
 * @return {string}
 */
function convertNumberToString(number, radix = 10) {
  if (typeof number !== 'number' || number !== number) return 'NaN'
  var integer = Math.floor(number),
      fraction = number - integer,
      string = '',
      fractionCount = 0;
  if (integer === 0) {
    string += 0;
  }
  while (integer > 0) {
    string = (_n = integer % radix) && (hexMap[_n] || _n) + string;
    integer = Math.floor(integer / radix);
  }
  if (fraction) {
    string += '.'
  }
  while (fraction > 0) {
    integer = Math.floor(fraction * radix);
    fraction = fraction * radix - integer;
    string += (hexMap[integer] || integer);
    if (fractionCount > 0) {
      fractionCount++;
    }
    if (fractionCount === 52 || fraction < Math.pow(10, -12)) {
      return string;
    }
    if (integer > 0 && fractionCount === 0) {
      fractionCount = 1;
    }
  }
  return string;
}
