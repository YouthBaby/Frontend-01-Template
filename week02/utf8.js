/**
 * @description UTF-8编码
 * @param {string} string 需要编码的字符
 * @return {Uint8Array} 编码后的buffer
 */
function _uft8_encode(string) {
  var codePoint = string.codePointAt(0).toString(2),
      tempList = getEncodeTemplate(Number(`0b${codePoint}`)).split(''),
      codeTail = codePoint.length - 1, tempTail = tempList.length - 1,
      buffer = new Uint8Array(tempList.length / 8);
  while (codeTail >= 0 && codeTail >= 0) {
    if (tempList[tempTail] === 'x') {
      tempList[tempTail] = codePoint[codeTail];
      codeTail--;
    }
    tempTail--;
  }
  while (tempList[tempTail] === 'x') {
    tempList[tempTail--] = '0'
  }
  for (var i = 0; i < tempList.length / 8; i++) {
    buffer[i] = parseInt(tempList.slice(8 * i, 8 * (i + 1)).join(''), 2)
  }
  return buffer
}

/**
 * @description 获取码点对应的编码模板
 * @param {number} codePoint 码点
 * @return {string} 编码模板
 */
function getEncodeTemplate(codePoint) {
  switch (true) {
    case codePoint >= 0x0000 && codePoint <= 0x007F:
      return '0xxxxxxx'
    case codePoint >= 0x0080 && codePoint <= 0x07FF:
      return '110xxxxx10xxxxxx'
    case codePoint >= 0x0800 && codePoint <= 0xFFFF:
      return '1110xxxx10xxxxxx10xxxxxx'
    case codePoint >= 0x00010000 && codePoint <= 0x0010FFFF:
      return '11110xxx10xxxxxx10xxxxxx10xxxxxx'
  }
}


function uft8_encode(string) {
  if (typeof string !== 'string' || string.length === 0) return;
  for (var str of string) {
    var encodeString = [..._uft8_encode(str)].map(value => value.toString(16)).join('').toUpperCase()
    console.log(`${str} 的UFT8编码为：${encodeString}\n`);
  }
}

uft8_encode('春眠不觉晓')

// 春的UFT-8编码为：E698A5

// 眠的UFT-8编码为：E79CA0

// 不的UFT-8编码为：E4B88D

// 觉的UFT-8编码为：E8A789

// 晓的UFT-8编码为：E69993