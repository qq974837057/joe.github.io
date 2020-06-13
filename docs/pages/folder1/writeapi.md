## 继承
> 在原型对象Parent.prototype上定义方法，在构造函数中定义属性。

分别有下面几类继承方式
- 构造函数：父类的构造函数通过call(this)，在子类构造函数中执行，继承父类的属性(拷贝属性副本)，但是父类原型上的方法无法继承。
- 原型链：将父类的实例当作子类构造函数的prototype原型对象，继承父类属性和方法，但是父类生成的实例属性如果是引用类型(也就是子类原型对象上有引用类型)，则会被子类生成的实例共享。
- 组合式：通过构造函数继承属性，通过原型链继承方法，保证每个子类的实例有自己的父类属性副本，而且可以通过原型链复用方法。
- 寄生组合式：由于组合式中，子类/父类的原型对象都是Parent.prototype，子类没有自己的constructor，无法区分是由父类直接new出来还是子类直接new出来的实例，所以通过Object.create(Parent.prototype)，创建一个中间对象，使得父类/子类的原型对象可以隔离开，然后将constructor指向Child构造函数，就完成最理想的整个继承过程。

### 构造函数继承：借助构造函数（父类构造函数在子类执行，this指向子类构造函数的实例）
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
### 原型链继承：借助原型链（子类构造函数的prototype赋值为父类的实例）
- 可以继承父类的原型上的属性和方法
- 但是包含引用类型值的原型对象的属性会被实例共享(这也是为什么要在构造函数上定义属性，而不是原型对象中定义属性的原因)
- 缺点：new Parent()出来的实例被当成Child生成出所有实例的原型对象，所以原型对象包含引用类型值的属性，就会被Child生成的实例所共享，改动其中一个，另一个实例也跟着改变。如改变play数组。
  ```js
  function Parent() {
      this.name = 'parent';
      this.play = [1, 2, 3];
  }
  Parent.prototype.say = function() {
      
  }
  function Child() {
      this.type = 'child';
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
### 组合继承
- 使用原型链实现继承原型方法，使用构造函数继承实例属性，每个实例都有自己的属性副本，避免共享引用属性。
- 缺点：执行了两次父类构造函数，且构造函数指的是父类的构造函数。
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
  // Child.prototype = new Parent() //执行第二次
  // 优化：换成父类构造函数的原型
  Child.prototype = Parent.prototype

  console.log(new Child) // Child {name: "parent", play: Array(3), type: "child"}
  let  child1 = new Child();
  let  child2 = new Child();
  child1.play.push(4);
  console.log(child1.play) // [ 1, 2, 3, 4 ]
  console.log(child2.play) // [ 1, 2, 3 ]
  child1.say()
  child2.say()
  ```
### 寄生组合继承：使用构造函数继承属性，使用原型链继承方法，创造一个父类原型的副本作为子类构造函数的原型。
- 前面组合式由于共用一个原型对象(Parent.prototype)，子类无自己构造函数，向上找构造函数是Parent。所以用Object.create隔离开原型，再给子类添加自己的构造函数）
- Object.create(obj) 创建的中间对象以参数为原型对象，形成原型链
- 内部原理：创建一个新的构造函数，它的prototype指向参数obj，再返回这个构造函数的实例，也就是新对象Obj。
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
  // true true  -> 根据原型链，instanceof判断都为true，那怎么区分开是父类实例化，还是子类实例化的？打印constructor就可以看到是父类构造函数还是子类构造函数。
  // function Child() {
  //     Parent.call(this) //执行第一次
  //     this.type = 'child'
  // }

  // child实例 -> 原型为Object.create(obj)中间实例对象Obj -> 它原型为Parent的prototype 
  //          -> 也就是Obj的构造函数和Parent的构造函数指向同一个原型对象
  ```
![寄生组合继承](./img/inherit-4.png)
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


## Object.create

作用：创建一个新对象，以参数obj作为新对象的__proto__

- 定义了一个临时构造函数
- 将这个临时构造函数的原型指向了传入进来的对象。
- 返回这个构造函数的一个实例。该实例拥有obj的所有属性和方法。

```js
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

## new

- new Object()创建新的obj对象。
- obj的`__proto__`链接到构造函数的原型。
- 执行构造函数，用apply使this指向新建的对象。
- 构造函数执行完有返回对象，返回该对象，返回非对象值，忽略。
- 执行完无返回对象，返回创建的obj对象。


```js
function New(fn) {
  const obj = new Object();
  if(fn.prototype !== null) {
    obj.__proto__ = fn.prototype;
  }
  const res = fn.apply(obj, [...arguments].slice(1));
  if((typeof res === 'object' || typeof res === 'Function' ) && res !== null) {
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
        habit: 'Games'
    }
}
// const joe1 = new test1('Joe', '25');
const joe1 = New(test1, 'Joe', '25');
console.log(joe1.name) // Joe
console.log(joe1.habit) // Games
console.log(joe1.weight) // undefined
console.log(joe1.age) // undefined

// 测试用例2-构造函数返回字符串-返回创建的obj
function test2 (name, age) {
    this.weight = 60;
    this.age = age;
    return 'handsome boy';
}
// const joe2 = new test2('Joe', '25');
const joe2 = New(test2, 'Joe', '25');
console.log(joe2.name) // undefined
console.log(joe2.habit) // undefined
console.log(joe2.weight) // 60
console.log(joe2.age) // 25
```


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
