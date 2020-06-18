
## JS数据类型
- 基本类型
  - Undefined
  - Null
  - Boolean
  - Number
  - String
  - Symbol(ES6-独一无二且不可变的)
  - BigInt(ES10)
- 引用类型
  - Object 对象
  - Array 数组
  - Function 函数
  - Date 日期
  - RegExp 正则
  - Math 数学对象

- 注意点：
  - Object是基础类型，其他所有引用类型都继承它的基本行为。
  - 使用 new + 构造函数 生成的实例，叫对象。构造函数上有定义默认属性和方法。
  - 函数也是对象。
  - null不是对象，虽然typeof null 是object，但是历史Bug，以前低位存储变量的类型信息，000开头代表对象，而null为全0，所以误判。
  - 函数参数是按值传递的，和赋值是一样的。基本类型就是复制该变量的值，如果参数是引用类型，赋值对象的内存地址值给函数内的局部变量，改动这个局部变量，外部对象会跟着改变，局部对象使用完会被销毁，如果局部对象更改成另一个对象内存地址，则指向另一个对象。

## BigInt
- 表示大于 2^53 - 1 的整数，可以表示任意大的整数。
- 也就是超过Javascript中可以用 Number 表示的最大数字。
- 使用 typeof 测试时， BigInt 对象返回 "bigint" 

- 使用方式
  - 在一个整数字面量后面加 n
  - 调用函数BigInt()
  ```js
  const BiggestInt1 = 9007199254740991n;

  const BiggestInt2 = BigInt(9007199254740991);
  // ↪ 9007199254740991n
  ```
- 注意：
  - 不能用于Math对象中的方法
  - 转换：BigInt 变量在转换成 Number 变量时可能会丢失精度。
  - 计算：BigInt 不能和 Number 实例混合运算，必须为同类型。
  - 排序：BigInt 和 Number 实例混合的数组可以进行sort。
  - 条件：与Number类似，只要不是0n，BigInt就被视为truthy的值。
  - 位运算：BigInt可以正常地进行位运算，如|、&、<<、>>和^
  - 比较：BigInt 和 Number 不是严格相等(===)的，但是宽松相等(==)的。
  ```js
  0n === 0
  // ↪ false

  0n == 0
  // ↪ true
  ```
- [兼容性](https://www.caniuse.com/#search=bigint)：
  - 目前IE、Safari、iOS Safari不支持

## 0.1+0.2为什么不等于0.3？

## 类型判断
基本类型
  - Boolean
  - Null
  - Undefined
  - Number
  - String
  - Symbol(ES6)
  - BigInt(ES10)

引用类型
  - Object [ Array、Function、Date、RegExp、Error...]

### typeof
- 基本数据类型使用typeof可以返回其基本数据类型(字符串形式)，但是null类型会返回object
- 引用数据类型使用typeof会返回object，函数会返回function，其他引用类型需要使用instanceof来检测引用数据类型。

### 判断引用类型

判断一：使用typeof，排除null特殊情况。
```js
function isObj(obj) {
    return (typeof obj === 'object' || typeof obj === 'function') && obj !== null
}
```

### 判断函数
- fun typeof function
- fun instanceof Function
- Object.prototype.toString.call(fun)是否为'[object Function]'

### 判断数组
- 1、Object.prototype.toString.call()
- 2、判断是否在Array的原型链上
- 3、Array.isArray()是ES5新增的方法
```js
1.  Object.prototype.toString.call(arr) //"[object Array]"

2.  [] instanceof Array; // true

3.  Array.isArray(arr) // true
```

### 判断null
- null===x 判断是否为null
- Object.prototype.`__proto__`===x 原始对象原型的原型即null

### 判断NaN
- Number.isNaN()


## 图片懒加载原理
```html
<div class="img-area">
    <img class="my-photo" alt="desc" data-src="./img/img1.png">
</div>
<div class="img-area">
    <img class="my-photo" alt="desc" data-src="./img/img2.png">
</div>
```

- 原理：
  - `<img>`标签的src属性先设置为空或者为默认图片的url，这样图片为空或默认图片。
  - 再设置data-src为真实的url，判断图片进入可视区域，通过el.dataset将真实url取出
  - 放入src属性中，浏览器发出请求，显示正常图片。

> alt 属性是一个必需的属性，它规定在图像无法显示时的替代文本。

> data-* 全局属性：构成一类名称为自定义数据属性的属性，可以通过HTMLElement.dataset来访问。

- 实现方法（2种）：
  - getBoundingClientRect
    - 获取元素大小和位置，针对视口左上角的坐标而言
    - 返回的对象包括top、right、botton、left、width、height属性
    - 判断图片已出现在屏幕中：el.getBoundingClientRect().top<=window.clientHeight （图片到可视区域顶部的距离）<=(可视区域的高度)
    - 加载方法是将src赋值为真实url：el.src = el.dataset.src

    - 首次进入页面【window.onload】或者滚动条滚动【window.onscroll】时遍历所有图片，若出现在屏幕内，则加载。
    - 优化：滚动条滚动检查图片采取使用节流函数；滚动时只检查剩余的图片；
  - 示例1：
    ```js
    function isInSight(el) {
      const bound = el.getBoundingClientRect();
      const clientHeight = window.innerHeight;
      //如果只考虑向下滚动加载
      //const clientWidth = window.innerWeight;
      return bound.top <= clientHeight + 100;
    }

    function checkImgs() {
      const imgs = document.querySelectorAll('.my-photo');
      Array.from(imgs).forEach(el => {
        if (isInSight(el)) {
          loadImg(el);
        }
      })
    }

    function loadImg(el) {
      if (!el.src) {
        const source = el.dataset.src;
        el.src = source;
      }
    }
    ```  
  - IntersectionObserver
    - 首次进入页面，通过新建IntersectionObserver对象io 并传入callback函数，用io.observe方法监听每个图片dom节点，当比例大于0小于1时，执行加载图片，加载完毕io.unobserve关掉该图片dom节点的监听。
    - callback函数传入参数为数组，每个元素有自己的target（dom节点）和intersectionRatio（在屏幕中出现比例）
    - 回调函数进行遍历每个元素执行下面操作
      - 判断图片已出现在屏幕中:intersectionRatio > 0 && intersectionRatio <= 1
      - 加载方法是将src赋值为真实url：el.src = el.dataset.src
      - el.onload后关闭观察器io.unobserve(el)。
    
    ```js
    var io = new IntersectionObserver(callback, option);
    io.observe(document.getElementById('example'));// 开始观察
    io.unobserve(element);// 停止观察
    io.disconnect();// 关闭观察器
    ```
    - 兼容性
      - Chrome 51+（发布于 2016-05-25）
      - Firefox 55
      - iOS 12.2  
  - 示例2：
    ```js
    const io = new IntersectionObserver(ioes => {
      ioes.forEach(ioe => {
        const el = ioe.target;
        const intersectionRatio = ioe.intersectionRatio;
        if (intersectionRatio > 0 && intersectionRatio <= 1) {
          loadImg(el);
        }
        el.onload = el.onerror = () => io.unobserve(el);
      });
    });

    function checkImgs() {
      const imgs = Array.from(document.querySelectorAll(".my-photo"));
      imgs.forEach(item => io.observe(item));
    }

    function loadImg(el) {
      if (!el.src) {
        const source = el.dataset.src;
        el.src = source;
      }
    }

    ```    

> 注意：获取dom之后要将所有图片dom节点转为数组对象才能使用数组遍历方法：Array.from