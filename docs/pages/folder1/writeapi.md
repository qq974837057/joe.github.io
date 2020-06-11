## 继承
### 构造继承：借助构造函数（父类构造函数在子类执行，this指向子类构造函数的实例）
- 缺点：只能继承属性，无法继承父类的原型上的方法
  ```js
  function Parent() {
      this.name = 'parent';
  }
  Parent.prototype.say = function() {
      
  }
  function Child() {
      Parent.call(this) 
      this.type = 'child'
  }
  console.log(new Child()) //name: "parent" type: "child"
  ```
### 原型继承：借助原型链（子类构造函数的prototype赋值为父类的实例）
- 缺点：原型对象共用了，一个类的两个实例，改动其中一个实例属性，另一个也跟着改变。如改变play数组
  ```js
  function Parent() {
      this.name = 'parent';
      this.play = [1, 2, 3]
  }
  Parent.prototype.say = function() {
      
  }
  function Child() {
      this.type = 'child'
  }
  Child.prototype = new Parent()
  console.log(new Child())
  ```
### 组合继承
- 缺点：执行了两次父类构造函数
  ```js
  function Parent() {
      this.name = 'parent';
      this.play = [1, 2, 3]
  }
  Parent.prototype.say = function() {
      
  }
  function Child() {
      Parent.call(this) //执行第一次
      this.type = 'child'
  }
  Child.prototype = new Parent() //执行第二次
  // 优化：换成父类构造函数的原型
  Child.prototype = Parent.prototype
  console.log(new Child)
  ```
### 寄生组合继承：优化（由于共用一个原型对象，子类无自己构造函数，向上找构造函数是Parent。所以用Object.create隔离开原型，再给子类添加自己的构造函数）
- Object.create 创建的中间对象以参数为原型对象，形成原型链
- 内部原理：创建一个新的构造函数，它的prototype指向参数obj，再返回这个构造函数的实例，也就是新对象。
  ```js
  function Parent() {
      this.name = 'parent';
      this.play = [1, 2, 3]
  }
  Parent.prototype.say = function() {
      
  }
  function Child() {
      Parent.call(this) //执行第一次
      this.type = 'child'
  }
  Child.prototype = Object.create(Parent.prototype)
  Child.prototype.constructor = Child
  var child = new Child()
  console.log(child instanceof Child , child instanceof Parent)
  console.log(child.constructor)
  // true true
  function Child() {
      Parent.call(this) //执行第一次
      this.type = 'child'
  }
  // child实例 -> 原型为obj中间实例对象 -> obj实例原型为Parent的prototype 
  //          -> 也就是obj的构造函数和Parent的构造函数指向同一个原型对象
  ```
### ES6 : class / extends 语法糖
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
    constructor(name) {
      super(name);
    }
    sayChildHello() {
      console.log("I'm child " + this.name)
    }
    // 重新声明父类同名方法会覆写,ES5的话就是直接操作自己的原型链上
    sayHello(){
      console.log("override parent method !,I'm sayHello Method")
    }
  }

  let testA = new Child('Joe')
  ```
### 区别
  - ES5 的继承使用借助构造函数实现，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面。ES6 的继承机制完全不同，实质是先创造父类的实例对象this（所以必须先调用super方法），然后再用子类的构造函数修改this。
  - ES6 在继承的语法上不仅继承了类的原型对象，还继承了类的静态属性和静态方法
## new
## Object.create
## call、apply
### call
```js
// 设置目标this的fn为函数本身
// 不要第一个this参数，取剩余传入的参数
// 目标this执行该fn函数(带参数)
// 删除该fn函数，返回结果

Function.prototype.call2 = function(context = window) {
  let result;
  context.fn = this;
  let args = [...arguments].slice(1);
  result = context.fn(...args);
  delete context.fn;
  return result;
}

// 测试用例
let test = { value: 666 };

function joe(name, age) {
  // 函数的传参
  console.log(name);
  console.log(age);
  // this对象里的内容
  console.log(this.value);
}

joe.call2(test, 'joe', 25);
// 'joe' 25 666
```
### apply
```js
// 设置目标this的fn为函数本身
// 取argument[1]数组为参数，展开并传入
// 目标this执行该fn函数(带参数，若无argument[1]则不带)
// 删除该fn函数，返回结果

Function.prototype.apply2 = function(context = window) {
  let result;
  context.fn = this;
  if(arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
}

// 测试用例
let test = { value: 666 };

function joe(name, age) {
  console.log(name);
  console.log(age);
  console.log(this.value);
}

joe.apply2(test, ['joe', 25]);
// 'joe' 25 666
```
## bind

> bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )

- 非函数调用bind报错
- 1. 返回一个函数，指定this为传入的第一个参数
- 2. 两个地方可传参数，执行bind时，执行bind的返回函数时，所以要将bind函数的arguments参数和返回函数的arguments参数concat()在一起。
- 3. bind返回的函数作为构造函数，bind时指定的this失效，但传入参数仍有效。
- 4. 判断this有没有被new构造函数改成指向实例，若被new调用(改变this)，则apply执行的this指向this，使context的this失效，否则为context。
- 5. 返回的函数作为构造函数需要实现继承(通过返回bound构造函数new出来的实例可以继承绑定函数的原型中的值)，为了避免绑定函数的prototype被同时修改，使用Object.create隔离开原型，再通过原型链实现继承。

```js
Function.prototype.bind2 = function(context) {
  if(typeof this !== 'function') {
    throw Error('not a function');
  }
  let fn = this;
  let args = [...arguments].slice(1);
  let bound = function() {
    return fn.apply(this instanceof bound ? this : context, args.concat([...arguments]));
  }
  // bound.prototype = fn.prototype; (不好)
  bound.prototype = Object.create(fn.prototype);
  return bound;
}

// 测试用例1

// 函数需要传 name 和 age 两个参数，可以在 bind 的时候，只传一个 name，在执行返回的函数的时候，再传另一个参数 age。
var test = { value: 1 };
function joe(name, age) {
    console.log(this.value);
    console.log(name);
    console.log(age);
}
var bindJoe = joe.bind2(test, 'joe');
bindJoe('25');  // 1 'joe' '25'

// 测试用例2

// 修改的是 bindFoo.prototype ，bar.prototype 的值没被影响修改
function bar() {}
var bindFoo = bar.bind2(null);
bindFoo.prototype.value = 1;
console.log(bindFoo.prototype.value); // 1
console.log(bar.prototype.value);     // undefined
```
## 防抖
## 节流
## 浅拷贝、深拷贝
## AJAX的promise版
