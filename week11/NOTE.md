### 红绿灯问题

题目：按照绿灯10S，黄灯2S，红灯5S顺序无限循环。

```js
// 核心函数 延迟多少S后执行
function sleep(s) {
  return new Promise(resolve => {
    setTimeout(resolve, s * 1000);
  })
}
```

异步编程（完整代码）

```js
const red = document.getElementById("red");
const yellow = document.getElementById("yellow");
const green = document.getElementById("green");
const lightMap = { 
  red,
  yellow,
  green
};

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms * 1000);
  })
}
function light(color) {
  Object.keys(lightMap).forEach(light => {
    lightMap[light].style.backgroundColor = light === color ? color : '#ccc';
  });
}
(void async function() {
  while(true) {
    light('green');
    await sleep(10);
    light('yellow');
    await sleep(2);
    light('red');
    await sleep(5);
  }
}())
```



### 寻路问题

优化点

- 使用二叉堆将取操作时间复杂度降到 O(logn)
- 监听cell事件改为监听父元素container mousemove事件
- 增加了穿墙判断





