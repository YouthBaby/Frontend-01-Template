// KMP等效状态机

// 获取失效数组
function getNexts(pattern) {
  let nexts = [-1], k = -1;
  for (let i = 1; i < pattern.length; i++) {
    while (k !== -1 && pattern[k + 1] !== pattern[i]) {
      k = nexts[k];
    }
    if (pattern[k + 1] === pattern[i]) {
      k++;
    }
    nexts[i] = k;
  }
  return nexts;
}

function end(c) {
  return end;
}

function createStates(pattern) {
  let states = [];
  let nexts = getNexts(pattern);
  let cached = {
    [pattern.length]: end
  };

  function createState(i) {
    return cached[i] || (cached[i] = function(c) {
      if (c === pattern[i]) {
        return createState(i + 1);
      } else {
        if (i > 0) {
          return createState(nexts[i - 1] + 1)(c);
        } else {
          return states[0];
        }
      }
    })
  }

  for (let i = 0; i < pattern.length; i++) {
    states[i] = createState(i);
  }

  return states;
}

function match(pattern, string) {
  let states = createStates(pattern);
  let state = states[0];
  for (let c of string) {
    state = state(c);
  }
  return state === end;
}

console.log(match('aaabaaabaaaa', 'aaabaaabaaacabaaaaba')); // true
