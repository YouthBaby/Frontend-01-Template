## JS中特殊的对象

### Bound Function Exotic Objects

- bind后的function与原来的函数相关联。通常调用bind后的函数会导致调用关联函数

### Built-in Function Objects

- [[call]] (thisArgument, argumentsList) 通过参数thisArgument和argumentsList调用，具有该私有字段的对象就是函数对象。
- [[Construct]] (argumentsList, newTarget) 调用方式与[[call]]相同，不同的是this值未初始化，并且newTarget值不为undefined。具有该私有字段的对象就是构造器。

### Array Exotic Objects

- 最特殊的就是length，length属性不可配置，会根据数组最大的下标自动发生变化。

### String Exotic Objects

- 为了支持下标运算，String 的正整数属性访问会去字符串里查找。length属性不可写、不可配置。

### Arguments Exotic Object

- arguments 的非负整数型下标属性跟对应的变量关联。

### Integer-Indexed Exotic Objects

- 跟内存块相关联。

### Module Namespace Exotic Objects

- [[Module]] 模块记录，导出自身命名空间
- [[Exports]] 字符串List、通过Array.prototype.sort(undefind)排序后的字符串List
- [[Prototype]] 总是为null

### Immutable Prototype Exotic Objects

- Object.prototype：作为所有正常对象的默认原型，不能再给它设置原型了。


