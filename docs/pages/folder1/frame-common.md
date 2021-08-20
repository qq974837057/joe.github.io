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

> react-router/vue-router 都是基于前端路由的拓展和封装，原理有两种，hash 和 history

> 回调指的是对应的路由路径，执行对应的页面跳转，或渲染对应的页面。

    ```js
    Router.route('/', function() {
      changeBgColor('yellow');
    });
    ```

- hash

  - 优点：兼容性好
  - 缺点：#符合不够美观，原理像 Hack
  - 步骤：

    - 简版：不带前进/回退
    - 完整：创建一个 history 保存记录，创建 index 指针指向前进后退的位置，定义后退方法，通过 location.hash 设置回对应的 hash，再执行刷新方法执行回调。

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

- history

  - 优点：url 美观,实现简洁
  - 缺点：HTML5 兼容性一般 IE10+ Chrome：5+
  - 实现：

    - 跳转 history.pushState(添加历史记录,修改当前 url,不跳转，执行回调)
    - 初始化 history.replaceState(不加历史记录,修改当前 url 地址，执行回调)
    - 监听 popstate(监听回退和前进,触发 pop,执行路由回调)
    - 触发 popstate：只有用户点击浏览器倒退按钮和前进按钮，或者使用 JavaScript 调用 back、forward、go 方法时才会触发。

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
