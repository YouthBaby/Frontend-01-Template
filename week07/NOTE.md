## layout

### 一、建模

- 通过十个变量建立主轴与交叉轴模型

```js
var mainSize, mainStart, mainEnd, mainSign, mainBase,
		crossSize, crossStart, crossEnd, crossSign, crossBase;
```



### 二、收集元素进行

 -	分行
   - 根据主轴尺寸，把元素分进行
   - 若设置了no-wrap, 则强行分配进第一行

### 三、计算主轴

 -	计算主轴方向
      	-	找出所有flex元素
         	-	把主轴方向的剩余尺寸按比例分配给这些元素
   	-	若剩余空间为负数，所有flex元素为0，等比例压缩剩余元素

### 四、计算交叉轴

 -	计算交叉轴方向
   - 根据每一行中最大元素尺寸计算行高
   - 根据行高flex-align和item-align，确定元素具体位置



## 绘制

### 一、绘制单个元素

-	依赖images包
-	在一个viewport绘制
-	相关属性：background-color、border、background-image

### 二、绘制DOM

- 对子元素递归render



