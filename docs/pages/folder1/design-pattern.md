## 设计模式和架构 ✨

### 面对对象编程

- 面向对象三大要素： 封装，继承，多态。
- 面向对象的软件设计原则：开放封闭原则。
  - 对扩展开放，意味着有新的需求或变化时，可以对现有代码进行扩展，以适应新的情况。
  - 对修改封闭，意味着类一旦设计完成，就可以独立完成其工作，而不要对类进行任何修改。
  - 实现思路：通过面向对象的继承和对多态机制实现开放，让类依赖于固定的抽象实现封闭。

### 前端常用设计模式

- 设计模式一句话概括：软件设计开发过程中，针对特点场景和问题的，更优解决方案。
- 核心操作：逻辑的变和不变分离，变的灵活，不变的稳定。
- 前端常见几种
  - 策略模式
  - 发布-订阅模式
  - 装饰器模式
  - 适配器模式
  - 代理模式
  - 责任链模式
- 策略模式：常用于条件判断优化
  - 要实现某种状态或某个功能，不同状态下有不同方案。我们可以定义多个策略，把它们一个个封装起来，对应条件使用对应策略。
  - 例子：按钮多种组合开关搭配、权限验证（多项条件封装成单独的函数，通过添加，可搭配组合）、表单验证
  - 适用场景：各判断条件下的策略相互独立且可复用；策略内部逻辑相对复杂；
- 发布-订阅模式：如 Vue 的事件总线 EventBus

  - 通过 event 事件中心，进行消息广播，通知订阅者。
  - 例子：流程启动后，发送至消息中心，消息中心派发消息，通知流程列表更新，通知审核。
  - 适用场景：各模块相互独立；存在一对多的依赖关系；依赖关系不稳定；

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

- 装饰器模式：给对象附加一些特定的方法

  - 一句话：在装饰器中传入一个要装饰的对象，动态的添加对象的行为。
  - 例子：赋予写英文的能力

    ```js
    const kuanWrite = function () {
      this.writeChinese = function () {
        console.log("我只会写中文");
      };
    };

    // 通过装饰器给阿宽加上写英文的能力
    const Decorator = function (old) {
      this.oldWrite = old.writeChinese;
      this.writeEnglish = function () {
        console.log("给阿宽赋予写英文的能力");
      };
      this.newWrite = function () {
        this.oldWrite();
        this.writeEnglish();
      };
    };

    const oldKuanWrite = new kuanWrite();
    const decorator = new Decorator(oldKuanWrite);
    decorator.newWrite();
    ```

- 适配器模式：解决兼容性问题，一个接口适配不同接口。
  - 一句话：解决我们不兼容的问题，把一个类的接口换成我们想要的接口。类似转接口
- 代理模式：通过代理对象，控制是否执行

  - 一句话：其它对象通过代理的形式控制这个对象的访问，但还是由这个对象本身去执行任务。
  - 例子：发邮件，通过代理模式，那么代理者可以控制一些黑名单过滤，决定发还是不发。
  - 适用场景：模块职责单一且可复用；两个模块间的交互需要一定限制关系

    ```js
    // 屏蔽邮箱list
    const emailList = ["qq.com", "163.com", "gmail.com"];
    // 代理
    const ProxyEmail = function (email) {
      if (emailList.includes(email)) {
        // 屏蔽处理
      } else {
        // 转发，进行发邮件
        SendEmail.call(this, email);
      }
    };

    const SendEmail = function (email) {
      // 发送邮件
    };

    // 外部调用代理
    ProxyEmail("cvte.com");
    ProxyEmail("ojbk.com");
    ```

- 责任链模式：如微前端改造脚本步骤，先构造一条责任链，最后执行 run 方法，按顺序执行。

  - 让多个对象都有可能接收请求，将这些对象连接成一条链，并且沿着这条链传递请求。
  - 例子：流程，上一个通过才能执行下一个。通过一个责任链的类，封装 fn，setNext，run 等方法，通过执行 setNext 设定下一步流程，执行 run 方法开始启动流程。
  - 适用场景：个完整流程；各环节有一定的执行顺序；各环节可复用；各环节可重组

    ```js
    // 解耦各节点：执行该流程：申请设备之后，接下来要选择收货地址，然后选择责任人
    const Chain = function (fn) {
      this.fn = fn;

      this.setNext = function () {};

      this.run = function () {};
    };

    const applyDevice = function () {};
    const chainApplyDevice = new Chain(applyDevice);

    const selectAddress = function () {};
    const chainSelectAddress = new Chain(selectAddress);

    const selectChecker = function () {};
    const chainSelectChecker = new Chain(selectChecker);

    chainApplyDevice.setNext(chainSelectAddress).setNext(chainSelectChecker);
    chainApplyDevice.run();
    ```

- 中介者模式：如多种条件组合判断是否有库存，可以增加一个中介者的 change 方法，进行统一的查询和判断。
  - 原因：多个对象按照一些关系和规则进行通信，对象越多越复杂。
  - 优点：增加一个中介者对象，解除对象与对象之间的紧耦合关系，所有相关对象通过中介者进行通信，而不是互相引用，对象之间几乎不知道彼此的存在，只能通过中介者对象来互相影响对方。
  - 缺点：中介者对象可能会比较巨大或复杂，比较难以维护。
  - 场景：对象复杂耦合导致维护出现困难，且随着项目的变化呈指数增长曲线，可以用此模式。
  - 现实生活的例子：机场的指挥塔
  - 代码示例
    - 购买手机的页面，有选择颜色的、有输入数量的、有选择内存的
    - 某个选项改动了，要对应判断结合其他几个对象的值，查询库存是否足够。
    - 每个选择都有大量的判断和操作，如果增加一个选项如 CPU 型号，需要改动大量代码。
    - 改进：增加中介者对象，返回一个 change 方法，每次有某个选项改动，调用中介者对象的 change 方法，里面统一执行判断查询和操作。后续增加需求，也只需改动中介者对象的 change 方法，容易维护。

### 【观察者】和【发布-订阅】模式的区别

- 相同
  - 都是某个对象(subject, publisher)改变，使依赖于它的多个对象(observers, subscribers)得到通知。
- 不同
  - 观察者模式【subject-observers】
    - 主体和观察者是互相感知的
    - 例子：奶农和个人
  - 发布-订阅模式【publisher-subscribers】
    - 发布者和订阅者是互不感知的，它们借助第三方来实现调度的。
    - 例子：像报社，邮局，个人，第三方就是邮局，负责报纸的订阅和发放。
    - Vue 中发布-订阅中的 dep(邮局)，负责添加订阅者 watcher(个人)，一旦发生修改(报社更新)，通知更新。
    - 适合更复杂的场景
