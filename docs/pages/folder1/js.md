## 学习链接
- [阮一峰-ES6入门教程](https://es6.ruanyifeng.com/)
- [冴羽-ES6完全使用手册](https://juejin.im/post/5bfe05505188252098022400#heading-1)
- [JavaScript教程](https://wangdoc.com/javascript/index.html)
- [MDN](https://developer.mozilla.org/zh-CN/)
- [JS Bin](https://jsbin.com/)

## JS数据类型
- 基本类型(7)
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
  - 基本类型保存在栈内存，引用类型保存在堆内存。
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

- 一句话：部分浮点数转二进制时因为标准位数的限制丢失了精度，计算完再转回十进制时和理论结果不同。
  - 0.1和0.2在转换成二进制后会无限循环，由于标准位数的限制后面多余的位数会被截掉，四舍五入，出现了精度的损失。
  - 相加后再转换为十进制就会变成0.30000000000000004。

- JS 的 Number 类型遵循的是 IEEE 754 标准，使用的是双精度浮点数，用64 位长度来表示【符号位(1)+指数(11)+尾数(52)】
![ IEEE 754 ](./img/IEEE-754.jpg)

- 计算过程
  - 转换过程：0.1 > 二进制 > 科学计数法 > IEEE 754(指数和小数分开表示) > 十进制(精度可能丢失)
  - 指数偏移的计算：双浮点固定偏移值 [2^(11-1)]-1 = 1023 加上 科学计数法的指数[如-4] 再转为11位的二进制表示。
  - 尾数计算：科学计数法的小数位选取52位，四舍五入。
  ```
  小数转为二进制：小数部分，乘以 2，然后取整数部分的结果(最后组合起来)，再用计算后的小数部分继续乘以 2，直到小数部分为 0。
  指数偏移：1023+(-4) = 1019 -> 011 1111 1011(二进制)
  尾数计算：1.10011001...(无限重复 1001) * 2^-4
  最终0.1的表示为：
    0          011 1111 1011      1001...( 11 x 1001)...1010
    (Sign)     (Exponent)         (Mantissa)
    (符号位)   (指数偏移的二进制)  (尾数：科学计数法后的小数位,选取52位)
  ```
  - 请注意选取52位中的最后四位，是 1010 而不是 1001，因为四舍五入有进位，这个进位就是造成 0.1 + 0.2 不等于 0.3 的原因，已经丢失精度。
  - 结果 0.1 + 0.2 = 0.30000000000000004


## 原型、原型链、继承
![JS-prototype](./img/JS-prototype.png)

- 原型：用来实现对象的属性继承的对象（instance的`__proto__`）（构造函数的prototype）
- 构造函数：通过new新建一个对象的函数（instance.constructor）（原型的constructor）
- 实例：通过new 和构造函数创建的对象
- 原型链：每个对象都有`__proto__`属性， 指向该对象构造函数的原型，`__proto__`属性 将对象连接起来组成原型链。
  - 查找：一个对象的属性不存在，沿着原型链上一级查找，找到就输出，找不到继续找，直到顶级的原型对象Object.prototype，没找到就输出undefined。
  - 修改：只会修改实例本身的属性，不存在则添加该属性。修改原型属性时，可以b.prototype.x=1，继承该对象的属性都会改变。
  - 关系：instance（实例）.constructor.prototype = instance（实例）的`__proto__`
  - 例子：const instance = new Object() //instance为实例，Object为构造函数，Object.prototype为原型
- 继承
  - 借助构造函数
      - 父类构造函数在子类执行，this指向子类构造函数的实例
      - 缺点：只能继承属性，无法继承父类的原型上的方法
  - 借助原型链
      - 使用父类的实例，作为子类构造函数的prototype
      - 缺点：父类生成的实例属性如果是引用类型(也就是子类原型对象上有引用类型)，则会被子类生成的每个实例共享，改动引用类型的属性会影响其他实例。
  - 组合：构造+原型链
      - 通过构造函数继承属性，通过原型链继承方法，保证每个子类的实例有自己的父类属性副本，而且可以通过原型链复用方法。
      - 缺点：执行了两次父类构造函数
  - 寄生组合式
      - 通过构造函数继承属性，通过原形链继承方法，创造一个父类原型的副本作为子类构造函数的原型【Object.create(Parent.prototype)+子类构造函数Child.prototype.constructor = Child】。
      - 解决：组合式中无法区分是父类创造还是子类创造出来的对象，因为instanceof都为true
      - 实现：创建的中间对象以父类的原型作为原型对象，中间对象又是子类的原型对象，形成原型链
      - 由于共用一个原型对象【Child.prototype = Parent.prototype】，子类无自己构造函数，向上找构造函数是Parent，所以用Object.create隔离开原型
      - 使父类原型对象和子类原型对象不再是同一个，而是增加一级，然后再给子类添加自己的构造函数
      ![寄生组合式](./img/inherit-4.png)


- Object.create(obj)
  - 生成一个新对象，新对象的`__proto__`为参数obj
  - 过程创建一个新的构造函数，它的prototype指向参数obj，再返回这个构造函数的实例，也就是新对象。
  ```
  function create(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  }
  ```

- 在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。
  - 原因是这将导致每次构造器被调用时，方法都会被重新赋值一次（也就是说，对于每个对象的创建，方法都会被重新赋值）。

## 作用域、作用域链
- 作用域：代码中定义变量的区域，确定当前执行代码对变量的访问权限范围。可以看做一个封闭空间。
- 作用域链和变量查找(只能下往上查找，不能由上往下，找到就停止，不会继续向上找)
    - 当查找变量的时候，会先从**当前上下文（作用域）的变量对象**中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。
- JavaScript 采用静态(词法)作用域：函数作用域在函数定义时决定的，基于函数创建的位置。
- 执行上下文栈：执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出，底部有globalContext全局上下文。
- 执行上下文（作用域）：(全局上下文、函数上下文)
    - 属性
        - 变量对象VO：存储上下文中定义的变量和函数声明，未进入执行阶段不能访问，叫VO，进入执行阶段，可访问，叫AO。
        - 作用域链
        - this
    - 全局上下文
        - 变量对象：全局对象window，由Object实例化的对象
    -  函数上下文
        - 变量(活动)对象AO：进入上下文被创建激活，属性可被访问(函数的形参、函数声明、变量声明)
    - **变量对象的两个阶段**
        - 分析(进入执行上下文): 创建AO(函数的形参、函数声明、变量声明)**，优先处理函数声明，如果变量名称与函数相同，不影响已存在函数。**
        - 执行(代码执行) :  按顺序执行，修改AO对象的值
    - **作用域链的两个阶段**(只能下往上查找，不能由上往下)
        - 每一个子函数都会拷贝上级的作用域（保存变量对象），形成一个作用域的链条
        - 函数创建时：内部属性 [[scope]]会保存所有父变量对象进去(父变量对象的层级链)
        ```
         bar.[[scope]] = [
                fooContext.AO,
                globalContext.VO
            ];
        ```    
        - 函数激活时：将自身AO添加到作用域头部，构成完整作用域链
        ```
        Scope = [AO].concat([[Scope]]);
        ```
- 函数执行上下文的变量对象和作用域创建全过程：
    - **保存父级作用域-创建变量(形参/函数/变量)-压入作用域头部-修改变量-弹出执行栈**
    - 函数定义，保存整个父级作用域(变量对象)到函数的内部属性[[scope]]
    - 函数准备执行，创建上下文，压入执行栈
    - 准备工作1：Scope:[[scope]]创建整个作用域，先将父级作用域存入，进入上下文
    - 准备工作2：arguments 创建AO进行初始化，加入形参、函数声明、变量声明
    - 准备工作3：AO压入作用域头部Scope:[AO, [[Scope]]]
    - 开始执行：修改AO属性值
    - 执行完毕：弹出上下文栈
- 变量提升
    - 概念：JS引擎解析代码，获取所有声明的变量，再一行一行运行。所有变量声明都会提升到代码头部。
    - 例子： 引擎将var a = 1拆解为var a = undefined和 a = 1，并将var a = undefined放到最顶端，a = 1还在原来的位置
        ```js
            var a = undefined // (声明提到代码头部)
            console.log(a) // undefined
            
            a = 1 // (原)var a = 1
            
            function b() {
                console.log(a)
            }
            b() // 1
        ```
    - 因为js是预解析创建执行上下文包括变量对象和函数参数，然后再执行代码。
        - 扫描函数，若有函数声明，【名称和对应值（函数对象(function-object)）】存入变量对象，同名函数会被覆盖。
        - 扫描变量，若有变量声明，【名称和对应值（undefined）】存入变量对象，同名变量会被覆盖。
        - 若变量和函数或形参同名，则不干扰前面已存在的。函数或形参优先。
        ```js
        console.log(foo);
        function foo(){
            console.log("foo");
        }
        var foo = 1;
        // ƒ foo(){
        //  console.log("foo");
        // }
        ```
        - 执行赋值或打印时，在当前作用域找是否有该变量，若存在，则使用，不存在则向上作用域寻找。
        - 函数的两种情况：函数声明为函数，所以函数声明是可以先在前面访问到。但函数表达式相当于变量，会被提升为undefined，所以用函数表达式后提前访问会出错。
        ```js
        foo();
        console.log(joe);
        joe();
        function foo(){
            console.log("foo");
        }

        var joe = function(){
            console.log("joe");
        };
        // foo
        // undefined
        // Uncaught TypeError: joe is not a function
        ```
        - 同名冲突处理：
            - 变量和变量：后者覆盖前者
            - 函数和函数：后者覆盖前者
            - 变量和函数：函数声明将覆盖变量声明
    - ES6中的let与const，阻止了变量提升，未声明就使用会报未定义的错。
    - 作用域分全局作用域、函数作用域、es6使用let/const创建的块级作用域，作用域链里的变量对象是一层一层push的，可以往上查找，但外层访问不到内层的作用域变量对象。而变量提升都是在自己的作用域头部，例如全局作用域 or 函数作用域的头部。
        
- [知乎解释](https://zhuanlan.zhihu.com/p/26533735)


## new运算符的实现
- new Object()创建新的对象obj。
- obj的`__proto__`链接到构造函数的原型`fn.prototype`。
- 执行构造函数，用apply使this指向新建的对象`fn.apply(obj, [...arguments].slice(1))`。
- 构造函数执行完若有返回引用类型的值，则返回该对象res，返回非引用类型的值，则忽略。
- 执行完无返回，则返回创建的对象obj。


## 闭包
> 概念：闭包 =『函数』和『函数对外部作用域的变量引用』的捆绑，即闭包可以从让内部函数访问外部函数作用域。本质是当前环境中存在指向父级作用域的**引用**。
  - 如在父函数声明a=1，在子函数console.log(a)
  - 闭包的作用域链包含着它自己的作用域，以及包含它的函数的作用域和全局作用域。
  - 通常，函数的作用域及其所有变量都会在函数执行结束后被销毁。但是，在创建了一个闭包以后，内部函数引用着外部函数的变量，这个函数的作用域就会一直保存到闭包不存在为止。
- 理论：其实广义上所有的JavaScript函数都是闭包，可以访问全局作用域的变量
- 实践：**即使创建子函数的上下文已经销毁，因为引用了父级，所以父级变量对象仍然保存在内存，不会被销毁**
- 创建方法：
    - 1.在一个函数内部创建另一个函数，并暴露出来(通过返回或者传给其他函数)
    - 2.IIFE(匿名函数+立即执行函数表达式)创建闭包，保存了全局作用域window和当前函数的作用域。
    - 3.异步中使用回调函数，其实就是使用闭包，如setTimeout、事件监听

    ```js
    // 函数中创建函数，并返回
    function f1() {
      var a = 2
      function f2() {
        console.log(a);
      }
      return f2;
    }
    var x = f1();
    x();//2

    // IIFE
    var a = 2;
    (function IIFE(){
      // 输出2
      console.log(a);
    })();

    // 回调
    function waitSomeTime(msg, time) {
    	setTimeout(function () {
    		console.log(msg);
    	}, time);
    }
    waitSomeTime('hello', 1000);

    // 在循环中创建闭包的常见问题：全部输出6
    for(var i = 1; i <= 5; i++) {
      setTimeout(function timer() {
        console.log(i);
      }, 0)
    }
    // 因为setTimeout为宏任务，等循环执行完再排队执行，此时找不到自己作用域的i，向上找到共享函数作用域的i，为6。需要产生一个私有的作用域来解决。
    // 方法一：使用ES6的块级作用域，作用域以块级为单位
    for(let i = 1; i <= 5; i++){
      setTimeout(function timer() {
        console.log(i);
      },0)
    }
    // 方法二：使用匿名闭包+立即执行函数，中间加个匿名函数，有独立的作用域，每个循环都保存自己的私有变量i
    for(var i = 1; i <= 5; i++){
      (function(j) {
        setTimeout(function timer() {
          console.log(j);
        }, 0)
      })(i)
    }
    ```

- 特性：
  - 1.函数嵌套函数 
  - 2.函数内部可以引用外部的参数和变量 
  - 3.外部的参数和变量不会被垃圾回收机制回收
- 应用：
    - 创建私有变量和方法（函数外部不能访问私有变量）
        ```js
        var singleton = (function(){
          // 私有变量
          var age = 22;
          var speak = function(){
            console.log("speaking!!!");
          };
          
          // 特权（或公有）属性和方法
          return {
            name: "percy",
            getAge: function(){
              return age;
            }
          };
        })();
        ```
    - 模块化代码，避免全局污染
        ```js
        var objEvent = objEvent || {};
        (function(){ 
            var addEvent = function(){ 
              // some code
            };
            function removeEvent(){
              // some code
            }
        
            objEvent.addEvent = addEvent;
            objEvent.removeEvent = removeEvent;
        })();
        ```
    - 防抖节流函数！私有化计时器变量，返回传入的函数，供外部使用。

- 缺点：
    - 常驻内存会增大内存使用量，容易导致内存泄露
    - 非特殊任务，不要在函数内创建其他函数，影响JS处理速度和内存消耗

## IIFE（立即调用函数表达式）
- 概念：在定义时就会立即执行的JS函数。
- 组成：由圆括号里的匿名函数( function() {...} ) + 使用()执行，有两种形式
```js
(function() {
  ...
})()

(function() {
  ...
}())
```
- 特性：
  - 跟其他函数一样，匿名函数有自己的独立作用域，外界无法访问内部变量。
  - 不同的是，它的函数为匿名形式，所以不会污染全局作用域(命名空间)。
```js
(function () { 
    var name = "Barry";
})();
// 外部无法访问变量 name
```

## ES6模块与CommonJS模块有什么区别？
> 其实也就是import（ES6 Module）和require（CommonJS）的区别

> CommonJS 是一种模块规范，最初被应用于 Nodejs，成为 Nodejs 的模块规范。运行在浏览器端的 JavaScript 由于也缺少类似的规范，在 ES6 出来之前，前端也实现了一套相同的模块规范 (例如: AMD)，用来对前端模块进行管理。自 ES6 起，引入了一套新的 ES6 Module 规范，在语言标准的层面上实现了模块功能，而且实现得相当简单，有望成为浏览器和服务器通用的模块解决方案。但目前浏览器对 ES6 Module 兼容还不太好，我们平时在 Webpack 中使用的 export 和 import，会经过 Babel 转换为 CommonJS 规范。在使用上的差别主要有：

- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口
- CommonJs 是动态语法可以写在判断里，ES6 Module 静态语法只能写在顶层
- CommonJs 是单个值导出，ES6 Module可以导出多个
- CommonJs 的 this 是当前模块，ES6 Module的 this 是 undefined

## 数组合并&对象合并
- 数组
  - ES6扩展运算符
  ```js
  const arr1 = [0, 1, 2];
  const arr2 = [3, 4, 5];
  const arr = [...arr1, ...arr2];
  // arr => [0, 1, 2, 3, 4, 5];
  ```

  - concat
  ```js
  const arr1 = [0, 1, 2];
  const arr2 = [3, 4, 5];
  const arr = arr1.concat(arr2);
  // arr => [0, 1, 2, 3, 4, 5]
  ```
  
  - for
  ```js
  const arr1 = [0, 1, 2];
  const arr2 = [3, 4, 5];
  for(let i in arr2) {
    arr1.push(arr2[i]);
  }
  // arr1 => [0, 1, 2, 3, 4, 5] 改变了arr1的原始值
  ```

  - push.apply
  ```js
  const arr1 = [0, 1, 2];
  const arr2 = [3, 4, 5];
  arr1.push.apply(arr1, arr2);   
  // arr1 => [0, 1, 2, 3, 4, 5] 改变了arr1的原始值
  ```

- 对象
  - Object.assign(target, ...sources)
  ```js
  const obj1 = { a: 0, b: 1, c: 2 };
  const obj2 = { c: 3, d: 4, e: 5 };
  const obj = Object.assign(obj1, obj2);
  // obj => { a: 0, b: 1, c: 3, d: 4, e: 5 }
  // obj1 => { a: 0, b: 1, c: 3, d: 4, e: 5 } // 改变了obj1的原始值
  ```

  - ES6扩展运算符
  ```js
  const obj1 = { a: 0, b: 1, c: 2 };
  const obj2 = { c: 3, d: 4, e: 5 };
  const obj = { ...obj1, ...obj2 };
  // obj => { a: 0, b: 1, c: 3, d: 4, e: 5 }
  ```

## 深浅拷贝

### 浅拷贝
![浅拷贝](./img/JS-copy-shallow.jpg)
- 定义：拷贝原对象生成新对象，如果属性是基本类型，拷贝它的值，如果是引用类型，拷贝它的地址，所以改变这个地址的内容，另一个对象也会跟着改变。
- 方法：
  - Object.assign({ },obj)
  - 展开运算符(...) -> {...obj}
  - Array.prototype.concat()
  - Array.prototype.slice()
  - 函数库lodash的_.clone方法
- 代码：
  ```js
  // Object.assign({ },obj)
  let obj1 = { person: { name: "joe", age: 25 }, sports: 'swimming' };
  let obj2 = Object.assign({}, obj1);
  obj2.person.age = 15
  console.log(obj1.person.age) // 15 被影响

  // 展开运算符(...)
  let obj1 = { name: 'joe', address:{ x:100, y:100 } }
  let obj2 = { ...obj1 };
  obj1.address.x = 120;
  obj1.name = 'joo';
  console.log(obj2); // { name: "joe", address: {x: 120, y: 100} }

  // Array.prototype.concat()
  let arr1 = [1, 3, { username: 'joe' }];
  let arr2 = arr1.concat();
  arr2[2].username = 'joo';
  console.log(arr1); // [ 1, 3, { username: 'joo' } ]

  // Array.prototype.slice()
  let arr1 = [1, 3, { username: 'joe' }];
  let arr2 = arr1.slice();
  arr2[2].username = 'joo';
  console.log(arr1); // [ 1, 3, { username: 'joo' } ]

  // 函数库
  let obj2 = lodash.clone(obj1);
  ```

### 深拷贝
![深拷贝](./img/JS-copy-deep.jpg)
- 定义：完全拷贝一个新对象，两个独立内存区域。修改时原对象不再受到影响。
- 方法：
  - JSON.parse(JSON.stringify())
    - 性能最快
    - 对象存在循环引用会报错
    - 只拷贝数组和对象，属性值为函数(变为null)、正则(变为空对象)、Date...时无法深拷贝
  - 手写实现递归
  - 函数库lodash的_.cloneDeep方法
- 场景：修改数据时，深拷贝一份数据存于当前编辑表单对象中，改动后，取消修改不会影响修改之前的数据。
- 代码：
  ```js
  // JSON.parse(JSON.stringify())
  let arr1 = [1, 3, { name: 'joe' }];
  let arr2 = JSON.parse(JSON.stringify(arr1));
  arr2[2].name = 'joo'; 
  console.log(arr1[2].name); // joe

  // 函数库
  let obj2 = lodash.cloneDeep(obj1);

  // 手写递归 - 详见手写API
  ```

## Map、Set、WeakMap、WeakSet
- 弱引用和强引用
  - 一个对象若只被弱引用所引用，不可访问（或弱可访问），可能在任何时刻被回收。
  - 可用于深拷贝中，当拷贝对象非常大时，使用Map造成内存消耗，需要手动清除Map 的属性。使用WeakMap可以成为弱引用，引用的对象释放后，拷贝的属性就会自动释放。
  - 如使用Map，对象间是存在强引用关系，手动释放obj，map对obj存在强引用，无法释放该内存。
  ```js
  let obj = { name : 'Joe'}
  const map = new Map();
  map.set(obj,'Joo');
  obj = null;
  ```
  - 使用WeakMap，weak对obj存在弱引用，下一次垃圾回收时，该内存会被释放。
  ```js
  let obj = { name : 'Joe'}
  const weak = new WeakMap();
  weak.set(obj,'Joo');
  obj = null;
  ```

## 运算符
- 递增 (++)
  - 概念：递增运算符为其操作数增加1，返回一个数值。
  - 两个位置：
    - 如果使用后置（postfix），即运算符位于操作数的后面（如 x++），那么将会在递增前返回数值，也就是先返回后增加。
    - 如果使用前置（prefix），即运算符位于操作数的前面（如 ++x），那么将会在递增后返回数值，也就是先增加后返回。


## 类型判断

#### typeof
- 基本数据类型使用typeof可以返回其基本数据类型(字符串形式)，但是null类型会返回object
- 引用数据类型使用typeof会返回object，函数会返回function，其他引用类型需要使用instanceof来检测引用数据类型。

#### 判断引用类型

判断一：使用typeof，排除null特殊情况。
```js
function isObj(obj) {
    return (typeof obj === 'object' || typeof obj === 'function') && obj !== null
}
```

#### 判断函数
- fun typeof function
- fun instanceof Function
- Object.prototype.toString.call(fun)是否为'[object Function]'

#### 判断数组
- 1、Object.prototype.toString.call()
- 2、判断是否在Array的原型链上
- 3、Array.isArray()是ES5新增的方法
```js
1.  Object.prototype.toString.call(arr) //"[object Array]"

2.  [] instanceof Array; // true

3.  Array.isArray(arr) // true
```

#### 判断null
- null===x 判断是否为null
- Object.prototype.`__proto__`===x 原始对象原型的原型即null

#### 判断NaN
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

## 内存管理
- 基本类型普遍被存放在『栈』中，而引用类型是被存放在堆内存的。
  - 不是所有基本类型都存在栈中，当基本类型被闭包引用后，也可以长期在内存堆中。
- 执行栈的函数如何使用保存在堆中的引用类型呢？
  - 上下文会保存一个内存堆对应复杂类型对象的内存地址，通过引用来使用复杂类型对象。
```js
function add() {
    const a = 1
    const b = {
        num: 2
    }

    const sum = a + b.num
}
```
示意图如下(暂时不考虑函数本身的内存)
![JS-heap-1](./img/JS-heap-1.png)

### 垃圾回收GC（Garbage Collection）
- V8的垃圾回收策略：分代回收
  - 新生代：对象的存活时间较短。新生对象或只经过一次垃圾回收的对象。
  - 老生代：对象存活时间较长。经历过一次或多次垃圾回收的对象。
- 回收算法：
  - 新生代：Scavenge 算法 + 对象晋升
  - 老生代：Mark-Sweep + Mark-Compact 算法 + 全停顿优化：Incremental Marking(增量标记)
- 新生代垃圾回收过程
![JS-GC-1](./img/JS-GC-1.png)
  - Scavenge算法将新生代空间分为两部分，使用中的 semispace 称为 「From 空间」，闲置的 semispace 称为 「To 空间」
  - 1.首先在From空间分配对象，如果空间满了，执行垃圾回收
  - 2.检查对象是否存活，不存活则释放该空间
  - 3.对象晋升：若对象存活，检查是否符合晋升（经历过一次Scavenge回收或To空间内存超过25%），满足晋升条件直接晋升到老生代，不满足则将对象从 From 空间复制到 To 空间。
  - 4.完成复制后，将 From 空间与 To 空间进行角色翻转（flip），继续下一轮的分配和回收。
![JS-GC-2](./img/JS-GC-2.png)
- 老生代垃圾回收过程
  - Mark-Sweep，标记清除。
    - 标记阶段，它将遍历堆中所有对象，并对存活的对象进行标记
    - 清除阶段，对未标记对象的空间进行回收
    - 存在的问题：经过一次标记清除后，内存空间变得不连续，再分配一个大对象时，无内存碎片支持该分配，会提前触发一次没必要的垃圾回收。
    ![JS-GC-3](./img/JS-GC-3.png)
  - Mark-Compact，标记整理。
    - 标记阶段，同上，再将标记的存活对象集中移到一边
    - 清除阶段，清理边界外的未标记对象。
    ![JS-GC-4](./img/JS-GC-4.png)
  - 总结：V8老生代主要使用Mark-Sweep算法，然后在当空间内存分配不足时，采用Mark-Compact算法。因为Mark-Compact需要移动对象，执行速度较慢。
  - 全停顿优化：
    - 垃圾回收算法在执行前，需要将应用逻辑暂停，执行完垃圾回收后再执行应用逻辑，这种行为称为 「全停顿」（Stop The World）。例如，如果一次GC需要50ms，应用逻辑就会暂停50ms。
    - 老生代中，存活对象多，垃圾回收时间长，全停顿造成的影响大。为了减少全停顿的时间，进行增量标记优化。
    - 增量标记(Incremental Marking)：在标记阶段，分成很多小步，每完成一小步，就执行一下应用逻辑，交替多次完成标记。
    ![JS-GC-5](./img/JS-GC-5.png)

### 内存泄漏
- [参考](https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng==&mid=2247496779&idx=2&sn=892d968a86ebd083582ae2e28f48ab8f&chksm=f9524108ce25c81e960471a63357cf2bc59971e2a22ca9549f67c5266100474712fcaa208f28&mpshare=1&scene=1&srcid=&sharer_sharetime=1592813500572&sharer_shareid=f72feefcc9c2c137677aa7f49d02e0f4&key=5275bdb85f6fecb5b863a0f4364938b0f20d3068a623c70bb17408602e09ad9840bc8824054c5f5f3e8b5fdacdf41cf6d13413049806b41cdb497e6abe7e48742dabb92c99874d17f7c19bace4019ecd&ascene=1&uin=MjI1NjQ0MTU1&devicetype=Windows+7+x64&version=62090523&lang=zh_CN&exportkey=AZvo2t51y73c8EhAeN7gjAk%3D&pass_ticket=KfXN%2BILZIw36ijjDu%2F7KSM38UJxJ2Cjf8FTYPf6jp%2Fg%3D)

- [分析Chrome性能调试工具Timeline简介](https://www.jianshu.com/p/f27b27167125)
- 滥用全局变量: 如未声明的变量，在函数中滥用this指向全局对象，无法被回收
  - 预防：使用严格模式（"use strict"）
- 闭包(返回子函数): 父执行完后，子函数中引用父的变量无法被释放，导致引用的变量被保留。
  - 预防：会用到，但要知道何时创建，保留哪些对象
- 定时器: 未被正确关闭，导致所引用的外部变量无法被释放
  - 预防：必要时销毁定时器如clearInterval
- 事件监听: 没有正确销毁，如使用监听执行匿名内联函数，无法使用removeEventListener() 将其删除
  ```js
  document.addEventListener('keyup', function() { 
    doSomething(hugeString); 
  });
  ```
  - 预防：
    - 将执行函数的引用传递进removeEventListener，来注销事件监听。
    - 还可以使用addEventListener() 第三个参数`{once: true}`，在处理一次事件后，将自动删除侦听器函数。
    ```js
    function listener() {
      doSomething(hugeString);
    }
    document.addEventListener('keyup', listener); 
    document.removeEventListener('keyup', listener); 
    ```
- DOM 引用: 在全局中对DOM节点的直接引用，删除该DOM节点，也不会被垃圾回收
  ```js
  function createElement() {
    const div = document.createElement('div');
    div.id = 'detached';
    return div;
  }
  const detachedDiv = createElement();
  document.body.appendChild(detachedDiv);
  // this will keep referencing the DOM element even after deleteElement() is called
  ```
  - 预防：
    - 使用弱引用WeakSet 和 WeakMap 保存 DOM 的引用
    - 将对DOM的引用移入函数局部作用域，函数使用完，局部变量对DOM的引用被销毁。
  ```js
  function createElement() {...} 
  function appendElement() {
      const detachedDiv = createElement(); // DOM的引用放在函数内
      document.body.appendChild(detachedDiv);
  }
  appendElement();
  ```


- 查看内存泄露： 
  - Chrome 中的 Performance 面板，可视化查看内存的变化情况，找出异常点。
  ![JS-heap-check](./img/JS-heap-check.png)
    - 打开开发者工具，选择 Performance 面板
    - 在顶部勾选 Memory
    - 点击左上角的录制按钮Record。
    - 在页面上进行各种操作，模拟用户的使用情况。
    - 一段时间后，点击对话框的 stop 按钮，面板上就会显示这段时间的内存占用情况。
    - 关注JS Heap，看到起点不断增高而没有释放内存，可能出现异常，点击预览图蓝色线增高点，看看执行了什么操作。去对应的函数中排查代码。

  - Chrome 中的 Memory 面板，可查看活动的Javascript对象（以及DOM节点）在内存中的分布
  ![JS-heap-2](./img/JS-heap-2.png)
    - Heap snapshot 堆快照，可截操作前后的内存快照，进行对比分析。
    - on timeline 时间线，可开始录制操作，执行一段操作，选择内存增大的时间点分析。


