## 前沿
- [2020大前端发展](https://mp.weixin.qq.com/s/b7PlbHZS6EY5kGpALpzMLA)

### TypeScript
- [接口Interfaces、枚举enum、泛型Generics](https://github.com/xcatliu/typescript-tutorial/blob/master/advanced/generics.md)    

- JS的超集，提供了类型系统，加上一些限制和扩展一些能力。
- 场景：
    - 错误提示和静态检查：函数传参类型错误提示，vscode的静态检查
    - API文档说明：定义函数的api文档，在使用中提示
    - 后台数据接口注释：根据后台文档定义字段写一些注释，用于请求接口数据的返回结构。 比如可以用Promise的泛型参数定义好的接口类型，then里面返回的数据就是满足接口类型的。
    - 增强后的class和enum枚举：class只有公有属性才允许使用。在enum当中，正反都可以当做key来用。
- 优点：
    - 清晰的函数参数/接口属性，增加了代码可读性和可维护性
    - 静态检查和编辑器提示减少低级错误的发生
    - 对库的使用者比较友好，有对应提示
    - Check JS：js中也可以获得自动提示和静态检查
- 使用TS的情况
    - 公共组件或库、有必要
    - 不重要的业务代码、节奏快的业务代码可不用
- 总览：
    - 原始类型
    - 任意值(any)
    - 联合类型("|")
    - 接口(interface)
    - `Array<number>`
    - 函数(声明式和表达式的类型定义有区别)
    - 枚举(enum)
    - 泛型`<T>`(调用这个方法的时候决定类型)
    - 类的属性方法修饰符(public公共、private私有、protected保护)
    - 类型推论：没有指定类型，根据初次赋值来确定
    - 类型断言(`<类型>`值)
    - 类型别名(常用于联合类型的自定义名字)
- 原始类型
    ```ts
    // 布尔值
    let isDone: boolean = false;  
    
    // 数值
    let decLiteral: number = 6;
    
    // 字符串
    let myName: string = 'Tom';
    
    // 没有返回值的函数为void
    function alertName(): void {
        alert('My name is Tom');
    }
    
    //声明一个 void 类型的只能将它赋值为 undefined 和 null
    let unusable: void = undefined;
    
    // undefined 类型的变量只能被赋值为 undefined，null 类型的变量只能被赋值为 null
    let u: undefined = undefined;
    let n: null = null;
    ```
    - 任意值
    ```ts
    let anyThing: any = 'hello';
    let anyThing: any = 888;
    let anyThing: any = true;
    
    // 变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型：
    let any;
    any = true;
    ```
    - 类型推论
    ```ts
    // 如果没有明确的指定类型，那么 TypeScript 会依照类型推论（Type Inference）的规则推断出一个类型。
    let myFavoriteNumber = 'seven';  等价于  let myFavoriteNumber :string= 'seven';
    ```
    - 联合类型
    ```ts
    // 当你允许某个变量被赋值多种类型的时候,使用联合类型,管道符进行连接
    let myFavoriteNumber: string | number;
    myFavoriteNumber = 'seven';
    myFavoriteNumber = 7;
    
    // 也可用于方法的参数定义, 都有toString方法,访问 string 和 number 的共有属性是没问题的
    function getString(something: string | number): string {
        return something.toString();
    }
    ```
    - 对象类型-接口interface
    
    ```ts
    
    interface Person {
        readonly id: number; // 只读属性
        name: string; // 必须有此属性，类型是string
        age?: number; // 表示这个属性可有可无
    }
    
    let tom: Person = {
        id: 89757, // 只读，不可二次赋值
        name: 'Tom'
    };
    ```
    - 数组
    ```ts
    let fibonacci: number[] = [1, 1, 2, 3, 5];
    let fibonacci: Array<number> = [1, 1, 2, 3, 5];
    
    // 用接口表示数组
    interface NumberArray {
        [index: number]: number;
    }
    let fibonacci: NumberArray = [1, 1, 2, 3, 5];
    
    // 类数组
    function sum() {
        let args: IArguments = arguments;
    }
    
    // 错误操作：push 方法只允许传入 number 类型的参数，但是却传了一个 string 类型的参数，所以报错了。
    let fibonacci: number[] = [1, 1, 2, 3, 5];
    fibonacci.push('8');
    ```
    - 函数
        - 声明式类型定义比较简单
        - 表达式需要对左侧的值手动加类型，否则就会根据类型推论来确定。
        ```ts
        // 需要把参数输入和结果输出都考虑到，例子均为number
        function sum(x: number, y: number): number {
            return x + y;
        }
        
        // 表达式的类型限制
        // => 用来表示函数的定义，左边是输入类型，需要用括号括起来，右边是输出类型。
        let mySum: (x: number, y: number) => number = function (x: number, y: number): number {
            return x + y;
        };
        
        // 也可以用接口定义
        interface SearchFunc {
            (source: string, subString: string): boolean;
        }
        
        let mySearch: SearchFunc;
        mySearch = function(source, subString) {
            return source.search(subString) !== -1;
        }
        
        // 可选参数
        function buildName(firstName: string, lastName?: string) {
            if (lastName) {
                return firstName + ' ' + lastName;
            } else {
                return firstName;
            }
        }
        let tomcat = buildName('Tom', 'Cat');
        let tom = buildName('Tom');
        
        // 参数默认值
        function buildName(firstName: string, lastName: string = 'Cat') {
            return firstName + ' ' + lastName;
        }
        ```
    - 类型断言
    ```ts
    形式1：值 as 类型
    形式2：<类型>值
    
    // 可以使用类型断言，将 something 断言成 string
    function getLength(something: string | number): number {
        if ((<string>something).length) {
            return (<string>something).length;
        } else {
            return something.toString().length;
        }
    }
    ```
    - 类型别名type：常用与联合类型自定义名字
    
    ```ts
    type Name = string;
    type NameResolver = () => string;
    type NameOrResolver = Name | NameResolver;
    function getName(n: NameOrResolver): Name {
        if (typeof n === 'string') {
            return n;
        } else {
            return n();
        }
    }
    ```
    - 枚举enum
        
    ```ts
    // 枚举（Enum）类型用于取值被限定在一定范围内的场景，比如一周只能有七天
    enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat};
    console.log(Days["Sun"]); // 0
    console.log(Days[0]); // 'Sun'
    ```
    - TypeScript 中类的用法
        - public 修饰的属性或方法是公有的，可以在任何地方被访问到，默认所有的属性和方法都是 public 的
        - private 修饰的属性或方法是私有的，不能在声明它的类的外部访问
        - protected 修饰的属性或方法是受保护的，它和 private 类似，区别是它在子类中也是允许被访问的
        ```ts
        class Animal {
          private name;
          public constructor(name) {
            this.name = name;
          }
        }
        
        let a = new Animal('Jack');
        console.log(a.name); // 报错
        a.name = 'Tom'; // 报错
        ```
        
    - 泛型`<T>`
        - T表示泛型，具体什么类型是调用这个方法的时候决定的
        - 可以为泛型中的类型参数指定默认类型。当使用泛型时没有在代码中直接指定类型参数，从实际值参数中也无法推测出时，这个默认类型就会起作用。
        
        ```ts
        // 表示入参和返回值都是T类型，根据调用时的类型决定
        function getData<T>(value:T):T{
          return value;
        }
        getData<number>(123);
        getData<string>('1214231');
        
        // 接口定义泛型
        // 定义接口
        interface ConfigFn{
            <T>(value:T):T;
        }
        var getData:ConfigFn=function<T>(value:T):T{
          return value;
        }
        getData<string>('张三');
        getData<string>(1243);  //错误
        
        // 泛型的默认类型
        function createArray<T = string>(length: number, value: T): Array<T> {
            let result: T[] = [];
            for (let i = 0; i < length; i++) {
                result[i] = value;
            }
            return result;
        }
        ```

- 接口：一个类只能继承自另一个类，有时候不同类之间可以有一些共有的特性，这时候就可以把特性提取成接口（interfaces）相当于一个小类，用 implements 关键字来实现继承方法。
    - 比如车、和防盗门都有报警器方法。`interface Alarm { }，class Car implements Alarm { }`
    - 接口之间可以继承、接口也可以继承类。`interface LightableAlarm extends Alarm  { }`
- 枚举：用于取值被限定在一定范围内的场景，比如一周只能有七天，颜色限定为红绿蓝等。
- 泛型：是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。

- 切换：
    - 标记类型和声明interface。
    - vue 2.x结合不是很好，vue的ts语法需要使用class风格


### PWA：渐进式网页应用
- 使用多种技术来增强web app的功能，能够模拟一些原生功能，比如通知推送。
- PWA仍然是网站，基于 Service worker，只是在缓存、通知、后台功能等方面表现更
好，让网页应用呈现和原生应用相似的体验。
- PWA: 开发成本低，加载速度快
- 原生：更强的计算能力，更可靠安全

### Flutter 谷歌 可跨平台开发（移动端、web、PC）
- 优点
    - 开源免费
    - 热重载，实时查看效果
    - 自定义组装
    - 缩进开发周期和成本
    - 适合App原型开发
- 缺点
    - 应用体积更大（hello world 应用都要7mb）
    - 需要Dart语言编程，并没那么流行

### 微前端
- 基于[single-spa](https://single-spa.js.org/)[教程](https://alili.tech/archive/11052bf4/)
- [蚂蚁金服](https://juejin.im/post/5d2ee768f265da1bd605da09#heading-3)
- 统一管理，入口统一，内容自定
- 好处：
    - 复杂度：避免代码庞大，编译过慢，复杂度低，便于维护
    - 独立部署：项目可独立部署
    - 技术灵活:兼容多技术栈，跳转不需要刷新页面
    - 可扩展：项目模块化可扩展，按需加载，性能更好
- 公司应用场景：主应用合并子应用：包括中控配网平台（分sit和pro）、运营平台（文章发布、广告管理）、插件管理平台

### Vue3.0
- （基于函数组合）composition-api抽逻辑，做可复用组件，同个逻辑组织在一块，更好维护-
- （基于vue2的option）所有methods、computed、data、props聚在一起，组件变大时候，很多联合关注点，用mixin了，可能导致命名空间冲突。
- 碎片：解除一个根节点的限制
- teleport：-类似react 的portal
- suspense
- tree-shaking（） 20多kb的runtime打包
- ts：用不用ts都可以，用js也可看到api的参数提示
- vuex@next
- vue-router@next
- 2.7最后一个2.x
- 稳定且切换成本高，不需要新功能的话，可以不用升级
- proxy性能更好

### Deno
- [Deno1.0](https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng==&mid=2247494712&idx=1&sn=9864ab7a7e86c10a5e503cdf1c447469&chksm=f952597bce25d06da0b23aff36d2db7847903ac34e6cdc8f97a47ad3f71c93f69bdaeaf723bc&mpshare=1&scene=1&srcid=0514iBBWWstWdIV6rACwfnbx&sharer_sharetime=1589460187316&sharer_shareid=f72feefcc9c2c137677aa7f49d02e0f4&key=ccdbd9bf2470f177f1778e8a536c75fa6ff0f4f9b4c018199c7ae9c39d9a59b26df87afc2538e03550e23af2e85e15d5a7a1af90c135f520a33283dd458dc86d40fbd5b642b95e4b53b6b8deca22ff71&ascene=1&uin=MjI1NjQ0MTU1&devicetype=Windows+10&version=62080079&lang=zh_CN&exportkey=AU6tiwanRNaXKDr8T%2F9oryw%3D&pass_ticket=jc2jFsb7uCiKjVYhP4G1wr338fKnSOS%2FPJb3BVzXbVQ%3D)
    - 好处    
        - 支持TypeScript
        - Deno 所有回调都是来自 promise 的
    - 目前局限
        - 缺乏与现有 JavaScript 工具的兼容，比如不兼容npm
        - http性能（每秒2w+请求）比node差（每秒3w+请求）


## 构建知识体系
- 如何构建：将散乱的知识点进行连接，分模块组织好
- 需要具备：完备性和逻辑关系（如面向对象和原型、作用域链和闭包）
- 三个能力：
    - 编程能力：数据结构+算法+语言表达
    - 架构能力：抽象（降低复杂性）、封装（屏蔽复杂性或细节）、解耦（降低依赖性）、复用（提高效率）
    - 工程能力：工具链、发布系统（如eslint、监控体系、持续集成）


## 其他
- npm版本号
    - X.Y.Z(主版本.次要版本.补丁版本)
        - X:有不兼容的API
        - Y:向后兼容的功能变化
        - Z:向后兼容的bug fix
    - 连字符-
        - 1.2.3 - 2.3.4  等价于 >=1.2.3 <=2.3.4
        - 1.2.3 - 2      等价于 >=1.2.3 <3.0.0
    - 波浪线~(推荐)
        - 次要版本不增加
        - ~1.2.3    等价于  >=1.2.3 <1.3.0
        - ~1.2      等价于  >=1.2.0 <1.3.0 (Same as 1.2.x)
        - ~0.2.3    等价于  >=0.2.3 <0.3.0
        - ~0.2      等价于  >=0.2.0 <0.3.0 (Same as 0.2.x)
        - 特殊情况
        - ~1        等价于 >=1.0.0 <2.0.0 (Same as 1.x)
        - ~0        等价于 >=0.0.0 <1.0.0 (Same as 0.x)
    - 脱字符^
        - 指定从左面起第一个非零位置的范围，以它为基准不变，后面小版本可变。
        - ^1.2.3    等价于 >=1.2.3 <2.0.0
        - ^0.2.3    等价于 >=0.2.3 <0.3.0
        - ^0.0.3    等价于 >=0.0.3 <0.0.4，即等价于0.0.3

- 抓包工具：
  - Fiddler 4
  - Charles

- Node版本：
  - Node.js 14.5.0 2020-06-30 
  - Node.js 11.0.0 2018-10-23
  - node10和node11事件循环有差异。