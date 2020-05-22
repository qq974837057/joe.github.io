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
## bind
## 防抖
## 节流
## 浅拷贝、深拷贝
## AJAX的promise版
