## node.js

### 文件路径和 path API

- 文件路径
  - `__dirname` : 总是返回被执行的 js 所在文件夹的绝对路径
  - `__filename`: 总是返回被执行的 js 的绝对路径
  - `process.cwd()`: 总是返回运行 node 命令时所在的文件夹的绝对路径
- path API
  - `path.dirname()`： 返回 path 的目录名
  - `path.join()`：所有给定的 path 片段连接到一起，会去除干扰的.
  - `path.resolve()`：方法会将路径或路径片段的序列解析为相对于当前目录的绝对路径，相当于 cd 命令

### 文件读取

- fs 模块
  - `const fs = require('fs')` 载入 fs 模块
  - fs 模块中所有方法都有同步和异步两种形式
  - readFileSync
  - writeFileSync
  - copyFileSync
- fs-extra 模块
  - 继承了 fs 模块的 API
  - 支持 promise

### url 模块

- `url.parse`：将一个 url 的字符串解析为一个 url 的对象
- `url.format`:将传入的 url 对象格式化为一个 url 字符串

### http 模块

- http 模块的使用`const http = require('http');const server = http.createServer(function(req,res){...}); server.listen(3000)`
- express = http 模块 + 中间件 + 路由

### 中间件和洋葱圈模型（Express 和 Koa）

![](./img/middleware-eggjs.png)

- 洋葱内的每一层都表示一个独立的中间件，用于实现不同的功能，比如异常处理、缓存处理等。
- 每次请求都会从左侧开始一层层地经过每层的中间件，当进入到最里层的中间件之后，就会从最里层的中间件开始逐层返回。
- 因此对于每层的中间件来说，在一个 请求和响应 周期中，都有两个时机点来添加不同的处理逻辑。
- 洋葱圈模型的应用：koa2、umi-request
- 中间件一般是通用的功能代码，与业务代码无关，比如设置响应时间、设置统一的响应内容
- express 是 next 机制
- 示例代码：获取执行耗费的时间，前置处理器和后置处理器分别放到 await next() 语句的前后来完成。

  ```js
  const Koa = require("koa");
  const app = new Koa();

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
  ```

### 内存泄漏

- 同 V8 的内存泄漏处理
- 检测工具
  - node-heapdump 获取内存快照对比
  - Easy-Monitor 可视化内存泄漏检查工具

### 跨域设置

- 设置 CORS 的 header 即可`res.header("Access-Control-Allow-xx","xx");`

## 前沿

- [2020 大前端发展](https://mp.weixin.qq.com/s/b7PlbHZS6EY5kGpALpzMLA)

### service worker

- 参考[https://mp.weixin.qq.com/s/vI2bxaFsFSB5rGC4Bkr8vQ]
- 概念
  - service worker 也是一种 web worker，额外拥有持久离线缓存的能力。
  - 宿主环境会提供单独的线程来执行其脚本，解决 js 中耗时间的运算过程带来的性能问题。
  - 可以在缓存面板里查到对应的缓存
- 特点
  - sw 监听 fetch 事件 拦截代理请求和返回，用 cacheStorage 缓存文件
  - 独立于 JS 引擎的线程，在后台运行，不影响页面渲染
  - 被 install 后永远存在，除非手动卸载 unregister()
  - 不能访问 window 和 dom
  - 需要 https 才能使用
- 过程

  - 注册`navigator.serviceWorker.register('./sw.js');`
  - 安装 install
  - 激活 activate
  - 监听 fetch 事件

- 谷歌出的工具 Workbox
  - 几种缓存策略
    - staleWhileRevalidate（安全可靠，一般用于静态资源）：有对应的 Cache 缓存结果就直接返回，在返回 Cache 缓存结果的同时会在后台发起网络请求拿到请求结果并更新 Cache 缓存
    - networkFirst（一般用于 html）：优先尝试拿到网络请求的返回结果，如果拿到网络请求的结果，就将结果返回给客户端并且写入 Cache 缓存。如果网络请求失败，那最后被缓存的 Cache 缓存结果就会被返回到客户端
    - cacheFirst（一般用于图片）：直接从 Cache 缓存中取得结果，如果 Cache 缓存中没有结果，那就会发起网络请求，拿到网络请求结果并将结果更新至 Cache 缓存
    - networkOnly： 强制正常网络请求
    - cacheOnly： 强制使用 cache 缓存
  - Workbox 原理
    - 通过 proxy 对全局对象 workbox 代理，如果找不到对应的模块，通过 importScripts 主动加载
- 兼容性
  - 除了 IE，支持度挺高

### PWA：渐进式网页应用

- 使用多种技术来增强 web app 的功能，能够模拟一些原生功能，比如通知推送。
- PWA 仍然是网站，基于 Service worker，只是在缓存、通知、后台功能等方面表现更
  好，让网页应用呈现和原生应用相似的体验。
- PWA: 开发成本低，加载速度快
- 原生：更强的计算能力，更可靠安全

### 微前端

- 基于[single-spa](https://single-spa.js.org/)[教程](https://alili.tech/archive/11052bf4/)
- [蚂蚁金服](https://juejin.im/post/5d2ee768f265da1bd605da09#heading-3)
- 结合 MPA 和 SPA 的优势，即保证应用具备独立开发权，又可以整合到一起保证产品完整的流程体验。为了解决前端协同开发问题，包括巨石应用分离和时间延续带来的升级维护问题。
- 统一管理，入口统一，内容自定
- 好处：
  - 复杂度：避免代码庞大，编译过慢，复杂度低，便于维护
  - 独立部署：项目可独立部署
  - 技术灵活:兼容多技术栈，跳转不需要刷新页面
  - 可扩展：项目模块化可扩展，按需加载，性能更好
- 缺点：
  - 子应用要确保隔离性、安全性
  - 不应该侵入 子应用的开发、构建、发布流程
- 社区知名有阿里的乾坤
  - 基于 SingleSPA，子应用提供加载和卸载的生命周期方法
  - 需要做 CSS 样式隔离和 JS 的沙箱(全局变量、事件处理)、父子应用的通讯
- 公司应用场景：主应用合并子应用：包括中控配网平台（分 sit 和 pro）、运营平台（文章发布、广告管理）、插件管理平台

### web component

- 参考[https://mp.weixin.qq.com/s/h8B1YxqOKtwr5CpNSYm_2A]
- 前言
  - 前端框架基于原生，提供更高的效率，更好的差异抹平。但是带来的是性能的下降（对比原生操作部分情况）和框架之间环境的隔离
  - 比如组件化思想，本质上是原生未直接提供对应的方式和 API，框架才需要构建一层体系来实现
- web component

  - 浏览器提供的原生 API 和模板，可以实现原生组件化，为了解决代码复用、组件自定义等问题
  - 开发者可以在不使用的框架的前提下进行组件化开发，而且开发出的组件可以无缝嵌入使用了框架的项目中
  - vue3.2 中，也初步引入了对于 web component 的使用

- 组成部分
  - 自定义元素：使用 api 开发自定义元素，包含生命周期和属性监听，`api：customElements.define`
  - Shadow DOM：用于隔离样式和脚本，api：`attachShadow`
  - HTML 模板：通过 template、slot 标签实现内容分发，包裹的内容不会显示，但可以被 js 引用，用于复用元素
- 兼容性
  - IE 完全不支持，其他支持性一般

### Vue3.0

- （基于函数组合）composition-api 抽逻辑，做可复用组件，同个逻辑组织在一块，更好维护-
- （基于 vue2 的 option）所有 methods、computed、data、props 聚在一起，组件变大时候，很多联合关注点，用 mixin 了，可能导致命名空间冲突。
- 碎片：解除一个根节点的限制
- teleport：-类似 react 的 portal
- suspense
- tree-shaking（） 20 多 kb 的 runtime 打包
- ts：用不用 ts 都可以，用 js 也可看到 api 的参数提示
- vuex@next
- vue-router@next
- 2.7 最后一个 2.x
- 稳定且切换成本高，不需要新功能的话，可以不用升级
- proxy 性能更好

### Flutter 谷歌 可跨平台开发（移动端、web、PC）

- 优点
  - 开源免费
  - 热重载，实时查看效果
  - 自定义组装
  - 缩进开发周期和成本
  - 适合 App 原型开发
- 缺点
  - 应用体积更大（hello world 应用都要 7mb）
  - 需要 Dart 语言编程，并没那么流行

### Deno

- [Deno1.0](https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng==&mid=2247494712&idx=1&sn=9864ab7a7e86c10a5e503cdf1c447469&chksm=f952597bce25d06da0b23aff36d2db7847903ac34e6cdc8f97a47ad3f71c93f69bdaeaf723bc&mpshare=1&scene=1&srcid=0514iBBWWstWdIV6rACwfnbx&sharer_sharetime=1589460187316&sharer_shareid=f72feefcc9c2c137677aa7f49d02e0f4&key=ccdbd9bf2470f177f1778e8a536c75fa6ff0f4f9b4c018199c7ae9c39d9a59b26df87afc2538e03550e23af2e85e15d5a7a1af90c135f520a33283dd458dc86d40fbd5b642b95e4b53b6b8deca22ff71&ascene=1&uin=MjI1NjQ0MTU1&devicetype=Windows+10&version=62080079&lang=zh_CN&exportkey=AU6tiwanRNaXKDr8T%2F9oryw%3D&pass_ticket=jc2jFsb7uCiKjVYhP4G1wr338fKnSOS%2FPJb3BVzXbVQ%3D)
  - 好处
    - 支持 TypeScript
    - Deno 所有回调都是来自 promise 的
  - 目前局限
    - 缺乏与现有 JavaScript 工具的兼容，比如不兼容 npm
    - http 性能（每秒 2w+请求）比 node 差（每秒 3w+请求）

## 构建知识体系

- 如何构建：将散乱的知识点进行连接，分模块组织好
- 需要具备：完备性和逻辑关系（如面向对象和原型、作用域链和闭包）
- 三个能力：
  - 编程能力：数据结构+算法+语言表达
  - 架构能力：抽象（降低复杂性）、封装（屏蔽复杂性或细节）、解耦（降低依赖性）、复用（提高效率）
  - 工程能力：工具链、发布系统（如 eslint、监控体系、持续集成）

## 其他

- npm 版本号

  - X.Y.Z(主版本.次要版本.补丁版本)
    - X:有不兼容的 API
    - Y:向后兼容的功能变化
    - Z:向后兼容的 bug fix
  - 连字符-
    - 1.2.3 - 2.3.4 等价于 >=1.2.3 <=2.3.4
    - 1.2.3 - 2 等价于 >=1.2.3 <3.0.0
  - 波浪线~(推荐)
    - 次要版本不增加
    - ~1.2.3 等价于 >=1.2.3 <1.3.0
    - ~1.2 等价于 >=1.2.0 <1.3.0 (Same as 1.2.x)
    - ~0.2.3 等价于 >=0.2.3 <0.3.0
    - ~0.2 等价于 >=0.2.0 <0.3.0 (Same as 0.2.x)
    - 特殊情况
    - ~1 等价于 >=1.0.0 <2.0.0 (Same as 1.x)
    - ~0 等价于 >=0.0.0 <1.0.0 (Same as 0.x)
  - 脱字符^
    - 指定从左面起第一个非零位置的范围，以它为基准不变，后面小版本可变。
    - ^1.2.3 等价于 >=1.2.3 <2.0.0
    - ^0.2.3 等价于 >=0.2.3 <0.3.0
    - ^0.0.3 等价于 >=0.0.3 <0.0.4，即等价于 0.0.3

- 抓包工具：

  - Fiddler 4
  - Charles

- Node 版本：
  - Node.js 14.5.0 2020-06-30
  - Node.js 11.0.0 2018-10-23
  - node10 和 node11 事件循环有差异。

```

```
