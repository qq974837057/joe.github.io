## 前沿
- [2020大前端发展](https://mp.weixin.qq.com/s/b7PlbHZS6EY5kGpALpzMLA)
### TypeScript
- [接口Interfaces、枚举enum、泛型Generics](https://github.com/xcatliu/typescript-tutorial/blob/master/advanced/generics.md)    
- 接口：一个类只能继承自另一个类，有时候不同类之间可以有一些共有的特性，这时候就可以把特性提取成接口（interfaces）相当于一个小类，用 implements 关键字来实现继承方法。
    - 比如车、和防盗门都有报警器方法。`interface Alarm { }，class Car implements Alarm { }`
    - 接口之间可以继承、接口也可以继承类。`interface LightableAlarm extends Alarm  { }`
- 枚举：用于取值被限定在一定范围内的场景，比如一周只能有七天，颜色限定为红绿蓝等。
- 泛型：是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。
- js的超集，加上一些限制和扩展一些能力。
- 场景：
    - 函数传参类型错误提示，vscode的静态检查
    - 定义函数的api文档，在使用中提示
    - 根据后台文档定义接口字段和注释，用于请求接口数据的返回结构。
    - 增强后的class和enum枚举，class只有公有属性才允许使用。在enum当中，正反都可以当做key来用
- 切换：
    - 标记类型和声明interface。
    - vue 2.x结合不是很好，vue的ts语法需要使用class风格
- 优点：
    - 清晰的函数参数/接口属性，增加了代码可读性和可维护性
    - 静态检查和编辑器提示
    - Check JS：js中也可以获得自动提示和静态检查
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

- 抓包工具：
  - Fiddler 4
  - Charles
- 版本：
  - Node.js 14.5.0 2020-06-30 
  - Node.js 11.0.0 2018-10-23
  - node10和node11事件循环有差异。