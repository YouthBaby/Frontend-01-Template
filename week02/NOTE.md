# 编程语言通识

## 按语法分类

- 非形式语言
  - 中文、英文
- 形式语言（乔姆斯基谱系）
  - 0型 无限制文法
  - 1型 上下文相关文法
  - 2型 上下文无关文法（大部分计算机语言主体）
  - 3型 正则文法（能用正则表达式解析的语法）

大部分计算机语言主体上属于 上下文无关文法（包括 JavaScript）

## [产生式练习](./BNF.md)

## 图灵完备性

- 图灵完备性（跟图灵机等效）
  - 命令式 —— 图灵机
    - goto
    - if和while
  - 声明式 —— lambda
    - 递归

## 类型系统

- 动态类型与静态类型
- 强类型（无隐式转换）、弱类型（有隐式转换）
- 复合类型
  - 结构体
  - 函数签名
- 子类型
  - 逆变、协变

# JavaScript 词法、类型

### unicode 字符集

- Blocks
  - U+0000 ~ U+007F（ASCII兼容部分、最稳定、最佳实践推荐区域）
  - U+4E00 ~ U+9FFF（CJK、中日韩三合一）
    - 包含各种extension（正则判断中文不准确）
  - U+0000 ~ U+FFFF（UCS编码范围）
- Categories
  - [各种空格](https://www.fileformat.info/info/unicode/category/Zs/list.htm)

### Atom词

#### InputElement

- WhiteSpace（空格）
  - TAB（U+0009）制表符
  - NBSP（U+00A0）no-break-space
  - ZWNBSP（U+FEFF）BOM：bit order mask（已淘汰）
- LineTerminator（换行）
  - LF（U+000A）Line Feed  \n（正常情况下用）
  - CR（U+000D）Carriage Return  \r
- Comment（注释）
  - 单行注释  // 注释内容一行 \n$
  - 多行注释  /* 注释内容可换行 */
- Token（词元）
  - Punctuator（符号）
  - IdentifierName
    - Keywords
    - Identifier
      - 变量名（不可以跟关键字重合）
      - 属性名（可以和关键字重合）
  - Literal（直接量）
    - Number（IEEE 754 Double Float）
      - Sign（1）+ Exponent（11）+ Fraction(52)
    - String
      - UTF-8编码
    - Boolean
    - Object
    - Null
    - Undefined
    - Symbol