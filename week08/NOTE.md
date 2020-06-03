## 选择器语法

- 简单选择器
  - *
  - div svg|a
  - .cls
  - #id
  - [attr=value]
  - :hover
  - ::before
- 复合选择器
  - <简单选择器> <简单选择器> <简单选择器>
  - *或者div必须写在最前面
- 复杂选择器
  - <复合选择器><sp><复合选择器>
  - <复合选择器>">"<复合选择器>
  - <复合选择器>"~"<复合选择器>
  - <复合选择器>"+"<复合选择器>
  - <复合选择器>"||"<复合选择器>

## 选择器优先级

- 四元组表示 [style，id，class，element]
- not、*不参与优先级运算
- 属性选择权重与class相同

## 伪类

- 链接/行为
  - :any-link
  - :link :visited
  - :hover
  - :active
  - :focus
  - :target
- 树结构
  - :empty
  - :nth-child()
  - :nth-last-child()
  - :first-child :last-child :only-child
- 逻辑型
  - :not伪类
  - :where :has（level4）

## 伪元素

- ::before
- ::after
- ::first-line
- ::first-letter