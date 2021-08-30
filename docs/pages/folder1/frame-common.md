## 主流框架的原理

- 相同：UI=f(state) 框架内部运行机制 根据状态渲染视图
- 区别：更新粒度不同，但没有优劣之分，只是对应实现不同
  - 应用级：React
    - 依赖虚拟 DOM
    - 不关心触发更新的节点（通过虚拟 DOM 全树 进行 diff 对比找到）
  - 组件级：Vue2
    - 依赖虚拟 DOM+ 细粒度更新
    - 关心触发更新的节点（只会对比该节点所在的组件级别的虚拟 DOM 树，不是全树）
  - 节点级：Svelte
    - 依赖预编译+ 细粒度更新，关联节点与其更新的方法，使用发布订阅监听状态变化，执行 update 方法更新视图
    - 关心触发更新的节点（节点和更新方法一一对应）

## React 和 Vue 的区别

> 相同的有：虚拟 DOM、组件化、核心库和功能库分开；

> 不同的有：Vue 推荐模板 template、React 推荐 JSX、React 是单向数据流，Vue 是双向绑定、改变视图数据方式不同、Vue 上手成本低。

- 相同

  - 虚拟 DOM
  - 组件化的架构
  - 核心库和其他功能库(如路由和状态管理库)

- 不同（新）
  | | React | Vue |
  | :------: | :------------------------------------------------: | :-----------------------------------------------------: |
  | 模板语法 | JSX，原生 JS 实现循环，条件 | Template(单文件组件), v-if 等指令实现条件等，也支持 JSX |
  | 数据流 | 单向 | 双向，响应式系统 |
  | 改变数据 | 显式调用 setState 改变状态 | 响应式渲染，通过数据劫持+发布订阅 |
  | 渲染优化 | shouldComponentUpdate 返回 false 避免不必要的 diff | 依赖收集，精确知道哪个组件更新 |
  | 上手成本 | 较高（JSX 和 ES6） | 较低（HTML、CSS、JS） |
  | 优点 | 大型项目、社区生态强大 | 上手简单、渲染快、体积小 |

- 不同（旧）

  - 改变数据：Vue 不需要想 React 那样 setState 改变状态，是响应式渲染页面的。
    - 数据劫持优势 1：无需显示调用，Vue 运用数据劫持+发布订阅,直接通知变化并驱动视图，react 则需要显示调用 setState
    - 数据劫持优势 2：精确得知变化数据 newVal
  - 组件更新：Vue 是收集依赖，精确知道哪个组件要更新，React 需要手动 shouldComponentUpdate 来表示该组件应该更新，较难优化。
  - Template 和 JSX： React 中只能使用 JSX 的渲染函数。Vue 推荐使用模板(单文件组件)，可以在偏视图组件使用模板，偏逻辑组件使用 JSX 或渲染函数。
  - 新建项目：Vue 提供了 CLI 脚手架，可选择适合自己的模板。React 在这方面也提供了 create-react-app，项目生成时不允许配置，只有默认生成单页应用的选项。
  - 上手成本：React 需要知道 JSX 和 ES2015，成本较高，Vue 起步看指南即可建立简单应用。
  - 原生渲染：Vue 对应 weex，React 对应 React Native，实现平台开发。
  - Vue 设置样式的默认方法是单文件组件里类似 style 的标签， React 中是通过 CSS-in-JS 的方案。

  - Vue 的优势是：【模板写法，上手简单】
    - 模板和渲染函数的弹性选择
    - 简单的语法和项目配置
    - 更快的渲染速度和更小的体积
  - React 的优势是：【适合大型、生态系统大】
    - 更适合大型应用
    - 同时适用于 Web 端和原生 App
    - 更大的生态系统，更多的支持和好用的工具

### React、Vue、Angular

|          | React | Vue  | Angular |
| :------: | :---: | :--: | :-----: |
| 虚拟 DOM |  是   |  是  |   否    |
| 数据绑定 | 单向  | 双向 |  双向   |
|   架构   | MVVM  | MVVM |  MVVM   |
| 流行程度 | 最高  | 中等 |  较低   |
| 内置功能 | 较低  | 中等 |  最多   |

## 虚拟 DOM

- Virtual DOM 即虚拟 DOM，是对 DOM 的抽象，本质是 JS 对象，用来描述 真实 DOM，不依赖具体框架。

- 虚拟 DOM 工作流：新旧两棵虚拟 DOM 树进行 diff，然后找出需要更新的内容，最后 patch 到真实 DOM 上。
  ![](./img/react-dom-1.png)
- 批量更新优化 batch：batch 的作⽤是缓冲每次⽣成的需要更新的补丁集，它会把收集到的多个补丁集
  暂存到队列中，再将最终的结果交给渲染函数，最终实现集中化的 DOM 批量更新。

### 优缺点

- 优点
  - 提高开发效率：数据驱动视图，函数式 UI 编程，不用手动操作 DOM。
  - 性能不错：减少操作 DOM，尽量一次性将差异更新到 DOM，性能虽然不是最优，但比粗暴操作 DOM 要好得多。
  - 跨平台能力：多出中间一层描述性的虚拟 DOM 是 JS 对象，通过适配层如 nodeOps 对象判断不同平台所封装的 API（如 Web，iOS，安卓，小程序），提供相同的接口如增加节点、删除节点，使这棵树映射到真实平台环境上，实现一套代码，多端运行。
- 缺点
  - JS 的计算比较耗时，但比起 DOM 操作不在一个量级。
  - 极端情况下，数据内容全部改变，diff 差量更新和操作 DOM 全部更新，性能差别不大。

## 前端路由

前端路由本质上就是监听 URL 的变化，然后匹配路由规则，执行对应回调，显示相应的页面，并且无须刷新，解决单页应用页面跳转，和浏览历史定位问题。

> react-router/vue-router 都是基于前端路由的拓展和封装，原理有两种，hash 和 history API

> 回调指的是对应的路由路径，执行对应的页面跳转，或渲染对应的页面。

    ```js
    Router.route('/', function() {
      changeBgColor('yellow');
    });
    ```

- hash

  - 优点：兼容性好
  - 缺点：#符号不够美观，原理像 Hack
  - 改变：`window.location.hash = 'xx'`
  - 监听：`window.addEventListener('hashchange',fn,false);`
  - 步骤：

    - 简版：不带前进/回退
    - 完整：创建一个 history 保存记录，创建 index 指针指向前进后退的位置，定义后退方法，通过 `window.location.hash` 设置回对应的 hash，再执行刷新方法执行回调。

    ```js
    // 简版
    class Routers {
      constructor() {
        // 保存对应路径和回调
        this.routes = {};
        // 当前url
        this.currentUrl = '';
        this.refresh = this.refresh.bind(this);
        // 监听路由hash变化
        window.addEventListener('load', this.refresh, false);
        window.addEventListener('hashchange', this.refresh, false);
      }
        // route方法定义回调
      route(path, callback) {
        // 将path路径与对应的callback函数储存
        this.routes[path] = callback || function() {};
      }
        // 刷新方法，执行回调
      refresh() {
        this.currentUrl = location.hash.slice(1) || '/';
        this.routes[this.currentUrl]();
      }
    }

    html：
    <li><a href="#/blue">turn blue</a></li>
    <li><a href="#/green">turn green</a></li>
    js:
    window.Router = new Routers();
    Router.route('/blue', function() {
      changeBgColor('blue');
    });
    Router.route('/green', function() {
      changeBgColor('green');
    });
    ```

- history API

  - 优点：URL 美观,实现简洁
  - 缺点：HTML5 兼容性一般 IE10+ Chrome：5+
  - 实现

    - 初始化 `history.replaceState(stateObj, title[, url]);`：不加历史记录,替换当前 url 地址，执行回调
    - 跳转 `history.pushState(stateObj, title[, url])`：追加一条历史记录,修改当前 url，执行回调
    - 监听 popstate 事件：监听回退和前进,触发 pop,执行路由回调
    - 触发 popstate：只有用户点击浏览器倒退按钮和前进按钮，或者使用 JavaScript 调用 `history.back()`、`history.forward()`、`history.go(xx)` 方法时才会触发，`history.pushState` 和 `history.replaceState` 不会触发，需要手动执行回调。

    ```js
    class Routers {
      constructor() {
        this.routes = {};
        // 在初始化时监听popstate事件
        this._bindPopState();
      }
      // 初始化路由
      init(path) {
        history.replaceState({ path: path }, null, path);
        this.routes[path] && this.routes[path]();
      }
      // 将路径和对应回调函数加入hashMap储存
      route(path, callback) {
        this.routes[path] = callback || function () {};
      }

      // 判断链接被点击，触发go函数，执行路由对应回调
      go(path) {
        history.pushState({ path: path }, null, path);
        this.routes[path] && this.routes[path]();
      }
      // 监听popstate事件
      _bindPopState() {
        window.addEventListener("popstate", (e) => {
          const path = e.state && e.state.path;
          this.routes[path] && this.routes[path]();
        });
      }
    }
    ```

## 单页(SPA)和多页(MPA)的区别

- 单页：只有一个主页面 html，局部刷新，只加载一次公共资源(js、css)，每次跳转只是切换显示的组件。
- 多页：多个独立页面 html，整页刷新，每个页面都要加载公共资源(js、css)。
- 场景：对体验和流程度要求高的使用单页，对 SEO 要求较高使用多页。
  - 路由模式：**单页是 hash 或者 history**，多页是普通链接跳转。
  - SEO: 单页较差，页面内容等待异步获取(需要单独方案如 SSR、预渲染)，多页较好，较多静态内容(实现方法简单)。
  - 体验：单页切换快，多页切换慢。
  - 数据传递：单页 Vuex 即可，多页使用缓存(localStorage)或 URL 参数等。
  - 成本：单页开发成本高要用框架，维护简单。多页前期开发成本低，维护麻烦，一个功能改动需要多处更改。
- SEO 优化
  - 网站设计优化：关键词、布局、代码拼写
  - 网站内容优化：栏目关键词、分析用户需求的内容
