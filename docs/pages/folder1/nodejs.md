## 前沿

- [2020 大前端发展](https://mp.weixin.qq.com/s/b7PlbHZS6EY5kGpALpzMLA)

### PWA：渐进式网页应用

- 使用多种技术来增强 web app 的功能，能够模拟一些原生功能，比如通知推送。
- PWA 仍然是网站，基于 Service worker，只是在缓存、通知、后台功能等方面表现更
  好，让网页应用呈现和原生应用相似的体验。
- PWA: 开发成本低，加载速度快
- 原生：更强的计算能力，更可靠安全

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
