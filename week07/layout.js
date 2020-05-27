var styleCache = Object.create(null);

function isDef(value) {
  return value !== null && value !== (void 0);
}

function getStyle(element) {
  if (styleCache[element]) {
    return styleCache[element];
  }

  var style = Object.create(null);

  for (let prop in element.computedStyle) {
    var value =  element.computedStyle[prop].value;

    if (value.toString().match(/^[0-9\.]+$/)) {
      value = parseInt(value);
    }
    if (value.toString().match(/px$/)) {
      value = parseInt(value);
    }

    style[prop] = value;
  }

  return styleCache[element] = style;
}

function layout(element) {
  if (!element.computedStyle) return;

  var elementStyle = getStyle(element);

  if (elementStyle.display !== 'flex') return;

  var items = element.children
    .filter(e => e.type === 'element')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  var style = elementStyle;

  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  })

  Object.keys(_d = {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
    alignContent: "stretch"
  }).forEach(prop => {
    if (!style[prop] || style[prop] === 'auto') {
      style[prop] = _d[prop];
    }
  })

  var mainSize, mainStart, mainEnd, mainSign, mainBase,
      crossSize, crossStart, crossEnd, crossSign, crossBase;

  if (style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainStart = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainStart = -1;
    mainBase = style.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainStart = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainStart = -1;
    mainBase = element.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexWrap === 'wrap-reverse') {
    [crossStart, crossEnd] = [crossEnd, crossStart];
    crossSign = -1;
    crossBase = style[crossSize];
  } else {
    crossSign = 1;
    crossBase = 0;
  }

  var isAutoMainSize = false;
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);
      if (isDef(itemStyle[mainSize])) {
        elementStyle[mainSize] += itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  var flexLine = [];
  var flexLines = [flexLine];
  var mainSpace = elementStyle[mainSize];
  var crossSpace = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);
    if (item[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (isDef(itemStyle[crossSize])) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (isDef(itemStyle[crossSize])) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;

  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = isDef(style[crossSize]) ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach(flexLine => {
      var mainSpace = flexLine.mainSpace;
      var flexTotal = items.reduce(function(total, item) {
        var itemStyle = getStyle(item);
        return total + (isDef(itemStyle.flex) ? itemStyle.flex : 0);
      }, 0);

      if (flexTotal > 0) {
        var currentMain = mainBase;

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        if (style.justifyContent === 'flex-start') {
          var currentMain = mainBase;
          var step = 0;
        }
        if (style.justifyContent === 'flex-end') {
          var currentMain = mainBase + mainSpace * mainSign;
          var step = 0;
        }
        if (style.justifyContent === 'cneter') {
          var currentMain = mainBase + mainSpace / 2 * mainSign;
          var step = 0;
        }
        if (style.justifyContent === 'space-between') {
          var step = mainSpace / (items.length - 1) * mainSign;
          var currentMain = mainBase;
        }
        if (style.justifyContent === 'space-around') {
          var step = mainSpace / items.length * mainSign;
          var currentMain = step / 2 + mainBase;
        }
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    })
  }

  var crossSpace;

  if (!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (var i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] += flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (var i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  var step;
  if (style.alignContent === 'flex-start') {
    crossBase = 0;
    step = 0;
  }
  if (style.alignContent === 'flex-end') {
    crossBase = crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === 'center') {
    crossBase = crossSign * crossSpace / 2;
    step = 0;
  }
  if (style.alignContent === 'space-between') {
    crossBase = 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length;
    crossBase = crossSign * step / 2;
  }
  if (style.alignContent === 'stretch') {
    crossBase = 0;
    step = 0;
  }
  flexLines.forEach(flexLine => {
    var lineCrossSize = style.alignContent === 'stretch' ?
      flexLine.crossSpace + crossSpace / flexLines.length :
      flexLine.crossSpace;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);
      
      var align = itemStyle.alignSelf || style.alignItems;

      if (itemStyle[crossSize] === null) {
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
      }

      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * crossSize;
      }

      if (align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }

      if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = crossBase + crossSign * (isDef(itemStyle[crossSize]) ? itemStyle[crossSize] : lineCrossSize);
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });

}

module.exports = layout;
