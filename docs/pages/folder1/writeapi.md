## 继承

> 在原型对象 Parent.prototype 上定义方法，在构造函数中定义属性。

分别有下面几类继承方式

- 构造函数：父类的构造函数通过 call(this)，在子类构造函数中执行，继承父类的属性(拷贝属性副本)，但是父类原型上的方法无法继承。
- 原型链：将父类的实例当作子类构造函数的 prototype 原型对象，继承父类属性和方法，但是父类生成的实例属性如果是引用类型(也就是子类原型对象上有引用类型)，则会被子类生成的实例共享。
- 组合式：通过构造函数继承属性，通过原型链继承方法，保证每个子类的实例有自己的父类属性副本，而且可以通过原型链复用方法。
- 寄生组合式：由于组合式中，子类/父类的原型对象都是 Parent.prototype，子类没有自己的 constructor，无法区分是由父类直接 new 出来还是子类直接 new 出来的实例，所以通过 Object.create(Parent.prototype)，创建一个中间对象，使得父类/子类的原型对象可以隔离开，然后将 constructor 指向 Child 构造函数，就完成最理想的整个继承过程。

#### 构造函数继承：借助构造函数（父类构造函数在子类执行，this 指向子类构造函数的实例）

- 缺点：只能继承属性，无法继承父类的原型上的方法
  ```js
  function Parent() {
    this.name = "parent";
  }
  Parent.prototype.say = function () {};
  function Child() {
    Parent.call(this);
    this.type = "child";
  }
  console.log(new Child()); //name: "parent" type: "child"
  ```

#### 原型链继承：借助原型链（子类构造函数的 prototype 赋值为父类的实例）

- 可以继承父类的原型上的属性和方法
- 但是包含引用类型值的原型对象的属性会被实例共享(这也是为什么要在构造函数上定义属性，而不是原型对象中定义属性的原因)
- 缺点：new Parent()出来的实例被当成 Child 生成出所有实例的原型对象，所以原型对象包含引用类型值的属性，就会被 Child 生成的实例所共享，改动其中一个，另一个实例也跟着改变。如改变 play 数组。

  ```js
  function Parent() {
    this.name = "parent";
    this.play = [1, 2, 3];
  }
  Parent.prototype.say = function () {};
  function Child() {
    this.type = "child";
  }
  Child.prototype = new Parent();
  console.log(new Child()); // Child {type: "child"} : type: "child" __proto__: Parent

  let child1 = new Child();
  let child2 = new Child();
  child1.play.push(4);
  console.log(child1.play); // [ 1, 2, 3, 4 ]
  console.log(child2.play); // [ 1, 2, 3, 4 ]
  ```

  ![原型链继承](./img/inherit-2.png)

#### 组合继承

- 使用原型链实现继承原型方法，使用构造函数继承实例属性，每个实例都有自己的属性副本，避免共享引用属性。
- 缺点：执行了两次父类构造函数，且构造函数指的是父类的构造函数。

  ```js
  function Parent() {
    this.name = "parent";
    this.play = [1, 2, 3];
  }
  Parent.prototype.say = function () {};
  function Child() {
    Parent.call(this); //执行第一次
    this.type = "child";
  }
  // Child.prototype = new Parent() //执行第二次
  // 优化：换成父类构造函数的原型
  Child.prototype = Parent.prototype;

  console.log(new Child()); // Child {name: "parent", play: Array(3), type: "child"}
  let child1 = new Child();
  let child2 = new Child();
  child1.play.push(4);
  console.log(child1.play); // [ 1, 2, 3, 4 ]
  console.log(child2.play); // [ 1, 2, 3 ]
  child1.say();
  child2.say();
  ```

#### 寄生组合继承 ✨

- 使用构造函数继承属性，使用原型链继承方法，创造一个父类原型的副本作为子类构造函数的原型。
- 前面组合式由于共用一个原型对象(Parent.prototype)，子类无自己构造函数，向上找构造函数是 Parent。所以用 Object.create 隔离开原型，再给子类添加自己的构造函数）
- `Object.create(obj)`创建的中间对象以参数为原型对象，形成原型链
- 内部原理：创建一个新的构造函数，它的 prototype 指向参数 obj，再返回这个构造函数的实例，也就是新对象 Obj。

  ```js
  function Parent() {
    this.name = "parent";
    this.play = [1, 2, 3];
  }
  Parent.prototype.say = function () {};
  function Child() {
    Parent.call(this); //执行第一次
    this.type = "child";
  }
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  var child = new Child();
  console.log(child instanceof Child, child instanceof Parent);
  console.log(child.constructor);
  // true true  -> 根据原型链，instanceof判断都为true，那怎么区分开是父类实例化，还是子类实例化的？打印constructor就可以看到是父类构造函数还是子类构造函数。
  // function Child() {
  //     Parent.call(this) //执行第一次
  //     this.type = 'child'
  // }

  // child实例 -> 原型为Object.create(obj)中间实例对象Obj -> 它原型为Parent的prototype
  //          -> 也就是Obj的构造函数和Parent的构造函数指向同一个原型对象
  ```

  ![寄生组合继承](./img/inherit-4.png)

#### ES6 : class / extends 语法糖

- 子类构造函数先调用 super 方法(相当于执行父类构造函数 ES5`Parent.call(this)`，this 指向子类)
- 然后可以在子类的构造函数中定义自己的属性。

  ```js
  class Parent {
    constructor(name) {
      this.name = name;
    }
    sayHello() {
      console.log("I'm parent!" + this.name);
    }
  }

  class Child extends Parent {
    constructor(name, position) {
      super(name); // 调用父类的 constructor(name)
      this.position = position;
    }
    sayChildHello() {
      console.log("I'm child " + this.name + this.position);
    }
    // 重新声明父类同名方法会覆写,ES5的话就是直接操作自己的原型链上
    sayHello() {
      console.log("override parent method !,I'm sayHello Method");
    }
  }

  let testA = new Child("Joe", "广州");
  testA.sayChildHello();
  // I'm child Joe 广州
  ```

#### 区别

- ES5 的继承使用借助构造函数实现，实质是先创造子类的实例对象 this，然后再将父类的方法添加到 this 上面。ES6 的继承机制完全不同，实质是先创造父类的实例对象 this（所以必须先调用 super 方法），然后再用子类的构造函数修改 this。
- ES6 在继承的语法上不仅继承了类的原型对象，还继承了类的静态属性和静态方法

## Object.create

作用：创建一个新对象，以参数 obj 作为新对象的**proto**

- 定义了一个临时构造函数
- 将这个临时构造函数的原型指向了传入进来的对象。
- 返回这个构造函数的一个实例。该实例拥有 obj 的所有属性和方法。

```js
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

## new ✨

- new Object()创建新的对象 obj。
- obj 的`__proto__`链接到构造函数的原型`fn.prototype`。
- 执行构造函数，用 apply 使 this 指向新建的对象`fn.apply(obj, [...arguments].slice(1))`。
- 构造函数执行完若有返回引用类型的值，则返回该对象 res，返回非引用类型的值，则忽略。
- 执行完无返回，则返回创建的对象 obj。
- 简洁实现

```js
function New(fn, ...args) {
  const obj = new Object();
  obj.__proto__ = fn.prototype;
  const res = fn.apply(obj, args);
  if ((typeof res === "object" || typeof res === "function") && res !== null) {
    return res;
  }
  return obj;
}
```

```js
function New(fn) {
  const obj = new Object();
  if (fn.prototype !== null) {
    obj.__proto__ = fn.prototype;
  }
  const res = fn.apply(obj, [...arguments].slice(1));
  if ((typeof res === "object" || typeof res === "function") && res !== null) {
    return res;
  }
  return obj;
}

// 测试用例1-构造函数返回对象-返回res
function test1(name, age) {
  this.weight = 60;
  this.age = age;
  return {
    name: name,
    habit: "Games",
  };
}
// const joe1 = new test1('Joe', '25');
const joe1 = New(test1, "Joe", "25");
console.log(joe1.name); // Joe
console.log(joe1.habit); // Games
console.log(joe1.weight); // undefined
console.log(joe1.age); // undefined

// 测试用例2-构造函数返回字符串-返回创建的obj
function test2(name, age) {
  this.weight = 60;
  this.age = age;
  return "handsome boy";
}
// const joe2 = new test2('Joe', '25');
const joe2 = New(test2, "Joe", "25");
console.log(joe2.name); // undefined
console.log(joe2.habit); // undefined
console.log(joe2.weight); // 60
console.log(joe2.age); // 25
```

## call、apply ✨

### call

- 简洁写法

```js
Function.prototype.call2 = function (context = window, ...args) {
  context.fn = this;
  const res = context.fn(...args);
  delete context.fn;
  return res;
};
```

```js
// 设置目标this的fn为函数本身
// 不要第一个this参数，取剩余传入的参数
// 目标this执行该fn函数(带参数)
// 删除该fn函数，返回结果

Function.prototype.call2 = function (context = window) {
  let result;
  context.fn = this;
  let args = [...arguments].slice(1);
  result = context.fn(...args);
  delete context.fn;
  return result;
};

// 测试用例
let test = { value: 666 };

function joe(name, age) {
  // 函数的传参
  console.log(name);
  console.log(age);
  // this对象里的内容
  console.log(this.value);
}

joe.call2(test, "joe", 25);
// 'joe' 25 666
```

### apply

- 简洁写法

```js
Function.prototype.apply2 = function (context = window, args) {
  context.fn = this;
  const res = context.fn(...args);
  delete context.fn;
  return res;
};
```

```js
// 设置目标this的fn为函数本身
// 取argument[1]数组为参数，展开并传入
// 目标this执行该fn函数(带参数，若无argument[1]则不带)
// 删除该fn函数，返回结果

Function.prototype.apply2 = function (context = window) {
  let result;
  context.fn = this;
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};

// 测试用例
let test = { value: 666 };

function joe(name, age) {
  console.log(name);
  console.log(age);
  console.log(this.value);
}

joe.apply2(test, ["joe", 25]);
// 'joe' 25 666
```

## bind

> bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )

- 非函数调用 bind 报错
- 1. 返回一个函数，指定 this 为传入的第一个参数
- 2. 两个地方可传参数，执行 bind 时，执行 bind 的返回函数时，所以要将 bind 函数的 arguments 参数和返回函数的 arguments 参数 concat()在一起。
- 3. bind 返回的函数作为构造函数，bind 时指定的 this 失效，但传入参数仍有效。
- 4. 判断 this 有没有被 new 构造函数改成指向实例，若被 new 调用(改变 this)，则 apply 执行的 this 指向 this，使 context 的 this 失效，否则为 context。
- 5. 返回的函数作为构造函数需要实现继承(通过返回 bound 构造函数 new 出来的实例可以继承绑定函数的原型中的值)，为了避免绑定函数的 prototype 被同时修改，使用 Object.create 隔离开原型，再通过原型链实现继承。

- 简洁写法

```js
Function.prototype.bind2 = function (context = window, ...args) {
  const fn = this;
  const newFun = function () {
    const newArgs = args.concat([...arguments]);
    return fn.apply(this instanceof newFun ? this : context, newArgs);
  };
  newFun.prototype = Object.create(fn.prototype);
  return newFun;
};
```

```js
Function.prototype.bind2 = function (context) {
  if (typeof this !== "function") {
    throw Error("not a function");
  }
  let fn = this;
  let args = [...arguments].slice(1);
  let bound = function () {
    return fn.apply(
      this instanceof bound ? this : context,
      args.concat([...arguments])
    );
  };
  // bound.prototype = fn.prototype; (不好)
  bound.prototype = Object.create(fn.prototype);
  return bound;
};

// 测试用例1

// 函数需要传 name 和 age 两个参数，可以在 bind 的时候，只传一个 name，在执行返回的函数的时候，再传另一个参数 age。
var test = { value: 1 };
function joe(name, age) {
  console.log(this.value);
  console.log(name);
  console.log(age);
}
var bindJoe = joe.bind2(test, "joe");
bindJoe("25"); // 1 'joe' '25'

// 测试用例2

// 修改的是 bindFoo.prototype ，bar.prototype 的值没被影响修改
function bar() {}
var bindFoo = bar.bind2(null);
bindFoo.prototype.value = 1;
console.log(bindFoo.prototype.value); // 1
console.log(bar.prototype.value); // undefined
```

## instanceof

- 检测构造函数的`prototype`属性是否出现在某个实例对象的原型链上
- 用法：object instanceof constructor （实例对象 instanceof 构造函数）
- String 对象和 Date 对象都属于 Object 类型，下面的类型 Car 生成 auto 的实例对象，即属于 Car，又属于 Object。

```js
// __proto__: 代表原型对象链
instance[__proto__] === instance.constructor.prototype;

// 示例：Car作为构造函数，auto为实例对象
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}
const auto = new Car("Honda", "Accord", 1998);

console.log(auto instanceof Car); // true
console.log(auto instanceof Object); // true

var simpleStr = "This is a simple string"; //(基本类型，查不到__proto__)
var newStr = new String("String created with constructor"); //(对象，有__proto__)
var myDate = new Date();

simpleStr instanceof String; // false
newStr instanceof String; // true
newStr instanceof Object; // true
myDate instanceof Date; // true
myDate instanceof Object; // true
```

- 模拟实现 instanceof

```js
function instance_of(L, R) {
  var O = R.prototype,
    L = L.__proto__;
  while (true) {
    if (L === null) return false;
    if (O === L) return true;
    L = L.__proto__;
  }
}
```

## 数组去重、拍平

### 去重

- 使用`[...new Set(arr)]`

```js
function uniqueArr(arr) {
  return [...new Set(arr)];
}
```

### 拍平

- 使用 reduce，判断当前元素是否为数组 Array，是的话，递归调用并合并
- 使用展开运算法，返回合并的数组

```js
function flatter(arr) {
  return arr.reduce((acc, cur) => {
    Array.isArray(cur) ? [...acc, flatter(arr)] : [...acc, cur];
  }, []);
}
```

## 防抖

- [木易杨](https://muyiy.cn/blog/7/7.2.html#underscore-%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90)
- 简版

  ```js
  function debounce(fn, wait) {
    let timer = null;
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, wait);
    };
  }
  ```

- 立即执行版的防抖

```js
function debounce(fn, wait = 100, immediate) {
  // 创建一个定时器，是下面返回函数的闭包中的变量，不被销毁
  let timer = null;
  return function () {
    if (immediate && !timer) {
      // 首次触发，立即执行
      fn.apply(this, arguments);
    }
    clearTimeout(timer); // 如果持续触发，不断清除定时器，不会执行 fn 函数
    timer = setTimeout(() => {
      // 计时器重新赋值，再计时
      fn.apply(this, arguments);
    }, wait);
  };
}
```

```js
// DEMO: 调用 debounce 函数，返回新函数
const betterFn = debounce(() => console.log("fn 防抖执行"), 1000, true);
// 滚动立即执行1次，停止滚动 1 秒后再次执行 () => console.log('fn 防抖执行')
document.addEventListener("scroll", betterFn);
```

## 节流

- 定时器版
  - 设置一个标志位 flag，初始为 true
  - 返回一个函数
    - 首先判断 flag 是否 false，是则 return 直接返回。
    - flag 不是 false，先置为 false，然后开始 setTimeout 计时，准备执行 fn。
    - 时间到，则执行`fn.apply(this, arguments)`，再把 flag 置为 true，继续下一轮的计时。

```js
function throttle(fn, wait) {
  let flag = true; // 利用闭包声明flag开关标志位，不被销毁
  return function () {
    if (!flag) {
      return; // 如果开关关闭，不执行下边的代码
    }
    flag = false; // 持续触发的话，flag一直是false
    setTimeout(() => {
      fn.apply(this, arguments);
      flag = true; // 到时间之后，函数执行，flag设为true，可进行下一轮计时
    }, wait);
  };
}
```

```js
// DEMO: 调用 throttle 函数，返回新函数
const betterFn = throttle(() => console.log("fn 节流执行"), 1000);
// 即使快速触发多次，也是每隔 1 秒后再执行 () => console.log('fn 节流执行')
document.addEventListener("scroll", betterFn);
```

- 时间戳版
  - 设置一个 prev 保存当前时间`new Date()`
  - 返回一个函数
    - 首先设置一个 now 为函数触发时间`new Date()`
    - 比较`now - prev `是否大于 wait (也就是当前时间与上次执行时间的时间差大于设置间隔值 wait)
    - 大于 wait 则执行`fn.apply(this, arguments)`，再将 prev 设为上次执行的时间`new Date()`，以供下次作比较。

```js
function throttle(fn, wait = 500) {
  let prev = new Date();
  return function () {
    let now = new Date();
    // 判断上次触发的时间和本次触发的时间差是否大于时间间隔wait
    if (now - prev > wait) {
      fn.apply(this, arguments); // 执行回调
      prev = new Date();
    }
  };
}
```

#### 防抖节流结合版

- maxWait 最大等待时间，如果防抖时间 wait 一直不执行的话，到了最大时间必须执行一次。

```js
function combine(fn, wait, maxWait) {
  let prev = new Date(),
    timer = null;
  return function () {
    let now = new Date();
    if (now - prev > maxWait) {
      fn.apply(this, arguments);
      prev = new Date();
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        prev = new Date();
      }, wait);
    }
  };
}
```

```js
const betterFn = combine(() => console.log("fn 结合版执行"), 1000, 10000);
// 停止滑动 1 秒后执行fn，10秒内一直没停止滑动，在10秒时刻执行一次fn
document.addEventListener("scroll", betterFn);
```

#### Lodash 的防抖节流

- 防抖函数(节流函数的封装，传入了一些配置，最后也是调用防抖函数)
- 节流有个 maxWait 最大等待时间，相当于防抖一直不执行的话，到最大等待时间就必须执行一次，里面会根据配置去判断剩余等待时间。
- 对外暴露一些方法 cancel(取消、清除定时器)、flush(立即执行)、pending(检查是否在计时)

## 浅拷贝、深拷贝 ✨

### 浅拷贝

- 思路：直接遍历赋值再返回即可。

```js
function clone(target) {
  let copy = {};
  for (const key in target) {
    copy[key] = target[key];
  }
  return copy;
}
let obj1 = { name: "joe", sport: { name: "swim" } };
let obj2 = clone(obj1);
console.log(obj2); // { name: 'joe', sport: { name: 'swim' } }

obj2.sport.name = "joo";
console.log(obj1); // { name: 'joe', sport: { name: 'joo' } }
```

### 深拷贝

- 思路：

  - 如果是基本类型或者函数，直接返回，两个对象使用一个在内存中处于同一个地址的函数也是没有任何问题。
  - 如果是 RegExp 或者 Date 类型，返回对应类型。
  - 如果是引用类型(数组、对象)，进行递归赋值。
  - 考虑循环引用的问题、使用一个 WeakMap 结构存储已经被拷贝的对象，每一次进行拷贝的时候就先向 WeakMap 查询该对象是否已经被拷贝，如果已经被拷贝则取出该对象并返回，WeakMap 键名只能为对象，不能为基本类型。 使用 WeakMap，map 和 obj 存在的就是弱引用关系，垃圾回收时内存会释放掉，节省内存消耗 。

- 常规版

```js
function deepClone(obj, map = new WeakMap()) {
  if (obj instanceof Date) return new Date(obj); // 专门处理Date
  if (obj instanceof RegExp) return new RegExp(obj); // 专门处理RegExp
  if (obj === null || typeof obj !== "object") {
    // 不是引用数据类型或是function, 直接返回
    return obj;
  }

  // 解决循环引用问题
  if (map.get(obj)) {
    return map.get(obj);
  }
  let copy = Array.isArray(obj) ? [] : {};
  map.set(obj, copy);

  // 遍历+递归赋值
  for (const key in obj) {
    copy[key] = deepClone(obj[key], map);
  }
  return copy;
}
// 测试用例
const obj = {
  arr: [1, 2],
  joe: { key: "对象" },
  a: () => {
    console.log("函数");
  },
  date: new Date(),
  reg: /正则/g,
};
obj.obj = obj;

const obj1 = deepClone(obj);
console.log(obj1);
// {
// arr: [ 1, 2 ],
// joe: { key: '对象' },
// a: [Function: a],
// date: 2020-07-01T09:39:52.799Z,
// reg: /正则/g,
// obj: [Circular]
// }
```

- 增强版

```js
// 考虑Set、Map
function deepClone(obj, map = new WeakMap()) {
  if (obj instanceof Date) return new Date(obj); // 专门处理Date
  if (obj instanceof RegExp) return new RegExp(obj); // 专门处理RegExp
  if (obj === null || typeof obj !== "object") {
    // 不是引用数据类型或是function, 直接返回
    return obj;
  }

  // 解决循环引用问题
  if (map.get(obj)) {
    return map.get(obj);
  }
  let copy = Array.isArray(obj) ? [] : {};
  map.set(obj, copy);

  // 克隆set
  if (obj instanceof Set) {
    copy = new Set();
    obj.forEach((value) => {
      copy.add(deepClone(value, map));
    });
    return copy;
  }

  // 克隆map
  if (obj instanceof Map) {
    copy = new Map();
    obj.forEach((value, key) => {
      copy.set(key, deepClone(value, map));
    });
    return copy;
  }

  // 遍历+递归赋值
  for (const key in obj) {
    copy[key] = deepClone(obj[key], map);
  }
  return copy;
}

// 测试用例
let mySet = new Set();
mySet.add(1); // Set [ 1 ]
mySet.add(2); // Set [ 1, 2 ]
let myMap = new Map();
myMap.set("keyString", "和键'a string'关联的值");
myMap.set("keyObj", "和键keyObj关联的值");

const obj = {
  arr: [1, 2],
  joe: { key: "对象" },
  a: () => {
    console.log("函数");
  },
  date: new Date(),
  reg: /正则/g,
  set: mySet,
  map: myMap,
};
obj.obj = obj;

const obj1 = deepClone(obj);
console.log(obj1);
// {
//   arr: [ 1, 2 ],
//   joe: { key: '对象' },
//   a: [Function: a],
//   date: 2020-07-01T09:44:28.949Z,
//   reg: /正则/g,
//   set: Set { 1, 2 },
//   map:Map {
//      'keyString' => '和键\'a string\'关联的值',
//      'keyObj' => '和键keyObj关联的值'
//       },
//   obj: [Circular]
// }
```

## Promise/A+ 实现

#### Promise/A+规范：

（1）一个 promise 必须有 3 个状态（state），pending（等待态），fulfilled（成功态），rejected（失败态）。当处于 pending 状态的时候，可以转移到 fulfilled 或者 rejected 状态。当处于 fulfilled 状态或者 rejected 状态的时候，就不可变。

（2）一个 promise 必须有一个 then 方法，then 方法接受两个参数：

```js
promise.then(onFulfilled, onRejected);
```

其中 onFulfilled 方法表示状态从 pending——>fulfilled 时所执行的方法，且有不可改变的值(value)，而 onRejected 表示状态从 pending——>rejected 所执行的方法，且有不可改变的值(reason)。

（3）为了实现链式调用，then 方法必须返回一个 promise

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

（4）executor 函数报错 直接执行 reject();

#### 用法：

```js
const promise = new Promise((resolve, reject) => {
  if ("操作成功") {
    resolve(result);
  } else {
    reject(error);
  }
});

promise.then(
  function (res) {
    // success
    console.log(res);
  },
  function (err) {
    // failure
    console.log(err);
  }
);
// 也可以使用箭头函数
```

#### 简版实现

- [资料](https://juejin.im/post/5b2f02cd5188252b937548ab#)

- promise 用类 class 声明
- new Promise 会传入函数，也就是构造函数的参数叫 executor，传入就立即执行。
- 构造函数中
  - 声明状态和回调函数数组、定义 resolve、reject 函数
  - `resolve/reject`中判断`pending`状态、改变 state 为`fulfilled/rejected`，赋值`this.value/this.reason`并遍历执行回调函数数组中的每个函数。
  - 执行传入的参数 executor 函数，try...catch... 执行出错直接`reject(err)`
- then 方法
  - 传入两个参数，`then(onFulfilled, onRejected)`
  - 分三个状态：
    - 'fulfilled'-> 执行回调函数 `onFulfilled(this.value)`
    - 'rejected' -> 执行回调函数 `onRejected(this.reason)`
    - 'pending' -> 传入回调函数数组保存起来 `this.onResolvedCallbacks.push(() => {onFulfilled(this.value);})`
    - 'pending'-> 传入回调函数数组保存起来 `this.onRejectedCallbacks.push(() => {onRejected(this.reason);})`

```js
class Promise {
  constructor(executor) {
    // 初始化state为等待态
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    // 解决异步调用resolve的情况，保存回调方法
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    // 如果executor执行报错，直接执行reject
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  // then 方法的两个参数onFulfilled onRejected
  then(onFulfilled, onRejected) {
    if (this.state === "fulfilled") {
      // 这里可以用setTimeout解决异步问题，放在下一个宏任务(标准是微任务)
      // setTimeout(() => {
      onFulfilled(this.value);
      // 这里可以实现链式调用（主要是then.call(x, fn, fn)的调用）
      // let x = onFulfilled(this.value);
      // resolvePromise(x, resolve, reject);
      // },0)
    }
    if (this.state === "rejected") {
      onRejected(this.reason);
    }
    // 一个promise可以有多个then，then时state还是pending等待状态，我们就需要在then调用的时候，将成功和失败存到各自的数组，一旦reject或者resolve，就调用它们
    if (this.state === "pending") {
      // onFulfilled传入到成功处理函数的回调数组
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value);
      });
      // onRejected传入到失败处理函数的回调数组
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

- resolvePromise(x, resolve, reject)函数：实现链式调用 then，让不同的 promise 代码互相套用
  - 取 x.then 作为下一个 then
  - `then.call(x, y => { resolvePromise(y, resolve, reject); }, err => {reject(err);})`
  - 通过上面绑定 x 环境执行 then，然后成功回调判断是否继续链式 then，失败回调直接 reject。

```js
function resolvePromise(x, resolve, reject) {
  if ((typeof x === "object" || typeof x === "function") && x !== null) {
    let then = x.then;
    // 如果then是函数，就默认是promise
    if (typeof then === "function") {
      // 让then执行 第一个参数是this ，后面是 成功的回调 和 失败的回调
      then.call(
        x,
        (y) => {
          // 继续判定是否仍为promise，是的话继续执行
          resolvePromise(y, resolve, reject);
        },
        (err) => {
          reject(err);
        }
      );
    } else {
      // 不是promise，直接成功即可
      resolve(x);
    }
  } else {
    // 普通值直接resolve
    resolve(x);
  }
}
```

#### Promise.all 实现 ✨

- 实现 Promise.all
- 思路
  - 首先返回个 new Promise
  - 设置一个结果数组 result 和一个计数 count
  - `for(let [key, val] of promises.entries())` 遍历 promsies 数组，使用`Promise.resolve(p)`转为 promise 对象
  - then 成功回调将 res 保存到 result 中，判断 count 是否执行完所有 promsie，是的话`resolve(result)`
  - then 失败回调将 err 抛出，`reject(err)`

```js
function all(promises) {
  return new Promise((resolve, reject) => {
    let result = [];
    let count = 0;
    for (let [i, p] of promises.entries()) {
      Promise.resolve(p).then(
        (res) => {
          count++;
          result[i] = res;
          if (count === promises.length) {
            resolve(result);
          }
        },
        (err) => {
          reject(err);
        }
      );
    }
  });
}
```

#### Promise.race 实现 ✨

```js
function race(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
}
```

#### 完整版

> 通过 promise/A+ : 包括链式调用 resolvePromise、then 异步队列、判断 onFulfilled、onRejected 非函数的情况、失败和成功只调用一次、catch

- then 标准是将其放在 microTask 微任务实现的，我们模拟只是用 setTimeout 实现异步，放在宏任务队列中。setTimeout 和 promise 同时存在时，代码顺序会存在问题。
- 返回 new Promise + resolvePromise 来实现链式调用
- 思路：
  - 待整理...

```js
// 通过 promise/A+
class Promise {
  constructor(executor) {
    // 初始化state为等待态
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    // 解决异步调用resolve的情况，保存回调方法
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    // 如果executor执行报错，直接执行reject
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  // then 方法 有两个参数onFulfilled onRejected
  // 规定onFulfilled,onRejected都是可选参数，如果他们不是函数，必须被忽略
  // onFulfilled返回一个普通的值，成功时直接等于 value => value
  // onRejected返回一个普通的值，失败时如果直接等于 value => value，则会跑到下一个then中的onFulfilled中，所以直接扔出一个错误reason => throw err

  then(onFulfilled, onRejected) {
    // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    // onRejected如果不是函数，就忽略onRejected，直接扔出错误
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    // then执行完会返回一个promise，叫promise2，方便链式调用
    let promise2 = new Promise((resolve, reject) => {
      if (this.state === "fulfilled") {
        setTimeout(() => {
          try {
            // x 为回调函数执行完的返回值
            let x = onFulfilled(this.value);
            // resolvePromise函数，处理自己return的promise和默认的promise2的关系
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.state === "rejected") {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.state === "pending") {
        // onFulfilled传入到成功处理函数的回调数组
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        // onRejected传入到失败处理函数的回调数组
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    // 返回promise，完成链式
    return promise2;
  }
  catch(fn) {
    return this.then(null, fn);
  }
}

// resolvePromise 让不同的promise代码互相套用
function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用报错
  if (x === promise2) {
    return reject(new TypeError("cycle error"));
  }
  let called; // 防止多次调用，成功和失败只能调用一个
  if ((typeof x === "object" || typeof x === "function") && x !== null) {
    try {
      // A+规定，声明then = x的then方法
      let then = x.then;
      // 如果then是函数，就默认是promise了
      if (typeof then === "function") {
        // 让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            // 继续判定是否仍为promise，是的话继续执行
            resolvePromise(promise2, y, resolve, reject);
          },
          (err) => {
            if (called) return;
            called = true;
            reject(err);
          }
        );
      } else {
        // 不是promise，直接成功即可
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      // 取then出错了那就不要再继续执行
      reject(e);
    }
  } else {
    // 普通值直接resolve
    resolve(x);
  }
}

//resolve方法 - 此处存在问题，如果传入的是promise，应该直接返回这个promise
Promise.resolve = function (val) {
  return new Promise((resolve, reject) => {
    resolve(val);
  });
};
//reject方法
Promise.reject = function (val) {
  return new Promise((resolve, reject) => {
    reject(val);
  });
};
//race方法
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};
//all方法(获取所有的promise，都执行then，把结果放到数组result，一起返回)
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let result = [];
    let count = 0;
    for (let [i, p] of promises) {
      resolve(p).then(
        (res) => {
          count++;
          result[i] = res;
          if (count === promises.length) {
            resolve(result);
          }
        },
        (err) => {
          reject(err);
        }
      );
    }
  });
};
```

- 测试：符不符合 promisesA+规范
  - npm 有一个 promises-aplus-tests 插件 用来测试自己的 promise。
  - npm i promises-aplus-tests -g 可以全局安装。
  - 命令行 promises-aplus-tests [js 文件名] 即可验证。

```js
// 进行测试之前，需要为 promises-aplus-tests 提供一个 deferred 的钩子：

Promise.deferred = function () {
  const defer = {};
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};
module.exports = Promise;
```

## AJAX 的 promise 版

```js
var newAjax = function (url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(data);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        resolve(json);
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        reject("Error: " + xhr.status);
      } else {
        reject("Error");
      }
    };
  });
};
```

## 发布-订阅模式

- 用一个事件对象 events 保存对应的回调函数数组
- on 方法：推入回调函数
- off 方法：过滤出回调函数
- emit 方法：遍历执行该事件的所有回调函数
- once 方法：包裹回调，执行一次后，调用 off 方法删除

```js
// 简单实现：订阅事件中心
const EventEmit = function () {
  this.events = {};
  // 添加订阅：往events内推入回调函数
  this.on = function (name, cb) {
    if (this.events[name]) {
      this.events[name].push(cb);
    } else {
      this.events[name] = [cb];
    }
  };
  // 删除订阅：过滤出不含对应callback的回调数组
  this.off = function (name, cb) {
    if (!this.events[name]) return;
    this.events[name] = this.events[name].filter((item) => {
      return item !== cb;
    });
  };
  // 触发事件：遍历执行事件中的回调函数
  this.emit = function (name, ...arg) {
    if (this.events[name]) {
      this.events[name].forEach((fn) => {
        fn(...arg);
      });
    }
  };
  // 只执行一次订阅事件：包裹一下，先执行一次，后删除订阅
  this.once = function (name, cb) {
    function fn() {
      cb();
      this.off(name, fn);
    }
    this.off(name, fn);
  };
};
// 业务代码
const event = new EventEmit();
// 回调函数
const handle = (msg) => {
  console.log(msg);
};
const msg = () => {
  event.on("success", handle);
};
const order = () => {
  event.on("success", () => {
    console.log("更新订单信息");
  });
};
const checker = () => {
  event.on("success", () => {
    console.log("通知管理员");
  });
};
// 取消订阅
const cancelMsg = () => {
  event.off("success", handle);
};

msg();
order();
checker();
event.emit("success", "消息参数");
// 消息参数
// 更新订单信息
// 通知管理员
cancelMsg();
// 更新订单信息
// 通知管理员
```

## 模拟一个字符串的 trim 函数

- 去除字符串的头尾空格

> 做法：正则匹配头尾的空格，替换成''。

```js
// 函数写法
function myTrim(str) {
  // ^表示开头 $表示结尾 +表示一个或多个 \s表示空白符
  let reg = /(^\s+)|(\s+$)/g;
  return str.replace(reg, "");
}

// 原型方法
String.prototype.myTrim = function () {
  return this.replace(/(^\s+)|(\s+$)/g, "");
};
```

## 数组 indexOf 的实现

- 判断 this 是否为 null 或者没传参 val，返回-1
- 循环当前数组，遍历到 i 位置的值===参数 val，返回 i
- 不存在返回-1

```js
Array.prototype.myIndexOf = function (val) {
  if (this == null || !val) {
    return -1;
  }
  let i = 0;
  let len = this.length;
  while (i < len) {
    if (this[i] === val) {
      return i;
    }
    i++;
  }
  return -1;
};
```
