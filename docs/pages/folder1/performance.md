## 概述
- 前端应用最影响性能的是加载速度，直接影响用户体验。
- 大部分页面需要2秒内完成加载，超过3秒，接近40%的用户离开网站。
- 所以优化方向就是让用户觉得加载得快！不仅包括加载指标速度的提升，还包括提高用户的体验，如有趣的loading或顺畅的骨架屏会让用户感觉并没有等太久。

- 性能优化方案步骤
1.分析目前性能缺陷，确定性能提升目标
2.针对特定场景，做对应方案，如加载时(首屏)，运行时(动画、内存泄漏、长列表)
3.实施方案，查看优化效果

## 性能指标
- [知乎参考](https://zhuanlan.zhihu.com/p/82981365)

- 指标概念
  - 是否发生？FP(首次绘制) - 屏幕首次有视觉变化的时间点
  - 是否发生？FCP(首次内容绘制) - 浏览器第一次向屏幕绘制内容(文本、图片...)
  - 是否有用？FMP(首次有意义绘制) - 页面主要内容出现在屏幕上的时间
  - 是否可用？TTI(可交互时间) - 已渲染完毕，可以响应用户的操作
  - FPS(每秒帧率) - 每秒钟画面更新次数，大部分屏幕为60次/秒

- 统计方式
  - 整体：
    - 通过 Performance 工具可以用来录制一段时间的 CPU 占用、内存占用、FPS 等运行时性能问题，如Bottom Up看出一段时间较耗时的操作。
    - 通过 Network 工具或者代码统计页面的加载时间来分析加载性能问题。
  - 手动查看分析：Chrome DevTools - Performance面板
    - Timings:查看FP、FCP、FMP
    - CPU:通过下方的summary查看占用比例
      - Loading: 网络通信和HTML解析
      - Scripting: JS执行
      - Rendering: 样式计算和布局
      - Painting: 重绘
      - System: 其它事件花费的时间
      - Idle: 空闲时间
      - Total: 总耗时
    - Main：倒置火焰图，横坐标表示消耗时间，纵坐标为函数调用栈，除了函数的耗时，还有Recalculate Style：样式计算。Layout：布局位置。
    - Frames:FPS帧率，水平线越低且持续时间长，同时上方会出现红色线条，代表画面卡顿。
    - Rendering：勾选FPS，可查看帧率和GPU内存使用情况
  - 代码：使用window.performance.timing
    ![timing API1](./img/Per-timingAPI-1.jpg)
    ![timing API2](./img/Per-API.jpg)
    - 起始点可选择：navigationStart(在URL输入栏回车或者页面按F5刷新的时间点) vs fetchStart(准备用 HTTP 请求获取文档的时间，除去重定向)
    - 白屏时间：从用户再按下回车的瞬间navigationStart 到 解析器完成工作domInteractive(即能看到第一个内容)
    ```js
    let t = window.performance.timing;
    let blankTime = t.domInteractive - t.navigationStart;          // 白屏时间
    let firstTime = t.domContentLoadedEventEnd - t.navigationStart; // 首屏加载时间
    let tcpTime = t.connectEnd - t.connectStart;                   // tcp连接耗时
    let dnsTime = t.domainLookupEnd - t.domainLookupStart;         // dns查询耗时
    ```
- 数据上传
  - `navigator.sendBeacon(url, data);`通过HTTP将少量数据异步传输到Web服务器(不支持IE)
  ```js
  window.addEventListener('unload', logData, false);
  function logData() {
      navigator.sendBeacon("/log", analyticsData);
  }
  ```
  - 或者使用`new Image()`方式自动get请求，进行降级上报。
- 注意：
  - 白屏时间可以通过FP、FCP来粗略代替，精确则使用`window.performance.timing`。
  - SPA通过`window.performance.timing`，只是首次加载的数据。改变URL实际不刷新页面，该API是无法获取子路由对应的页面相关时间。

    ```js
    // FP
    function getFPTime(){
        const timings = performance.getEntriesByType('paint');
        return timings ? Math.round(timings[0].startTime) : null
    }
    // FCP
    function getFCPTime(){
        const timings = performance.getEntriesByType('paint');
        return timings.length > 1 ? Math.round(timings[1].startTime) : null
    }

    // FMP 尚无标准化的定义

    // TTI 谷歌npm包 - tti-polyfill

    // FPS
    //不掉帧的情况，requestAnimationFrame 这个方法在一秒内会执行 60 次。假设动画在时间 A 开始执行，在时间 B 结束，耗时 x ms。而中间 requestAnimationFrame 一共执行了 n 次，则此段动画的帧率大致为：n / (B - A)。

    // 设备信息
    window.navigator.userAgent     // 获取用户设备信息
    window.navigator.language      // 获取用户设备语言
    window.navigator.connection    // 获取设备网络信息
    window.devicePixelRatio        // 获取设备像素比
    ```
    ![用户设备信息](./img/Per-device.png)

- 注意：
  - FP和FCP可能是相同的时间，也可能是先FP后FCP
  - 帧率能够达到 50 ～ 60 FPS 的动画将会相当流畅，让人倍感舒适；帧率在 30 FPS 以下或者帧率波动很大的动画，让人感觉到明显的卡顿和不适感；

- 获取函数执行耗时
  - 只能控制台调试用(不要在生产环境使用)
    - `console.time('1');fn();console.timeEnd('1');`
  - 获取时间戳，然后相减。
    - `Date.now();` 时间精度为 毫秒（10^-3）级别；
    - `new Date().getTime();`
    - `+new Date();`
  - 更精确的方案
    - 浏览器：`window.performance.now()`获取从`window.performance.timing.navigationStart`到当前时刻的毫秒数，带小数点。`performance.timing.navigationStart + performance.now()` 约等于 `Date.now()`。
    ```js
    function doSomething(){
      for(let i=0;i<1000;i++){
        i=i+1;
      }
    }
    let t0 = window.performance.now();
    doSomething();
    let t1 = window.performance.now();
    console.log("doSomething函数执行了" + (t1 - t0) + "毫秒.")
    // doSomething函数执行了0.09499990846961737毫秒.
    ```
    - Node环境：`process.hrtime.bigint()`，直接通过两个 bigint 相减来计算差异。在 Node.js 程序中，优先选 `process.hrtime`，其次选 `performance.now`，最后才会是 `Date.now`。
    ```js
    const start = process.hrtime.bigint();
    // 191051479007711n
    setTimeout(() => {
      const end = process.hrtime.bigint();
      // 191052633396993n
      console.log(`基准测试耗时 ${end - start} 纳秒`);
      // 基准测试耗时 1154389282 纳秒
    }, 1000);
    ```

- 打包后文件体积
  ```
  npm run build -- --report 查看打包后的大小
  ```
  - 主要是vendors依赖包文件js较大，和app主代码块较大，下面为某项目举例
    - stat 原始大小 2.7mb
    - parsed 压缩插件处理后  1.08mb (40%)
    - gzip 压缩后 300kb (10%)


- 客户端渲染&服务端渲染&预渲染
  - 客户端渲染：用户访问 url，请求 html 文件，前端根据路由动态渲染页面内容。关键链路较长，有一定的白屏时间；
  - 服务端渲染：用户访问 url，服务端根据访问路径请求所需数据，拼接成 html 字符串，返回给前端。前端接收到 html 时已有部分内容；
  - 预渲染：构建阶段生成匹配预渲染路径的 html 文件（注意：每个需要预渲染的路由都有一个对应的 html）。构建出来的 html 文件已有部分内容。不适合个性化、经常变化的内容使用预渲染。
![客户端渲染&服务端渲染&预渲染](./img/Per-SSR&Prerender.png)

- 客户端渲染(CSR)
  - 优点：客户端体验好
  - 缺点：首屏加载慢，不利于seo(抓取不到通过 Ajax 获取到的内容)

- 服务端渲染(SSR)
  - 优点
    - 更好的 SEO：数据已包含在页面，无须异步Ajax获取内容，方便爬虫抓取。
    - 首屏加载更快：直接渲染好后返回，无须再下载js再渲染。
  - 缺点
    - 开发条件限制：只支持 beforeCreate 和 created 两个钩子函数，一些外部扩展库需要特殊处理。且服务器需要处于Node.js运行环境。
    - 服务器负载：占用更多CPU资源，负载更大。

## 加载时
> 加载时可以以首屏加载速度来做优化

### 首屏加载
> 首屏的加载速度很重要,过长的白屏会导致用户流失。
> WEEX生成的是JS渲染成原生组件，此部分不适用

- 用户体验感知
  - 前置loading：插件html-webpack-plugin，白屏时展示loading图。
  - 骨架屏占位：插件vue-server-renderer，展示大体结构，视觉过渡流畅。
    - 将vue文件转为html 和css字符串，骨架屏的样式通过`<style></style>`标签直接被插入，而骨架屏的内容也被放置在`div#app`之间

- 网络和缓存
  - HTTP2：二进制分帧、多路复用、头部压缩、服务端推送
  - 拆包 + 缓存策略：webpack 4.x 对SplitChunksPlugin插件进行拆包配置 + 强制缓存和协商缓存，将第三方库设置较长的强缓存时间

- 懒加载
  - 图片懒加载（vue-lazyload）原理：进入可视区域再加载图片
    - 使用：src换成v-lazy
    ```html
    <img v-lazy="/static/img/1.png">
    ```
  - 路由懒加载（不同路由组件分割代码块chunk，访问该路由才加载对应js）结合 Vue 的异步组件和 Webpack 的代码分割(Code Splitting)功能
    ```js
    const Foo = () => import('./Foo.vue')
    const router = new VueRouter({
      routes: [
        { path: '/foo', component: Foo }
      ]
    })
    ```
  - 组件级别懒加载
    - 思路：IntersectionObserver条件判断是否出现在屏幕(图片懒加载也使用过此API) + v-if 指令渲染组件 + 骨架屏触发屏幕条件判断(大体灰白结构)
  - 组件keep-alive
    - 在页面已经跳转后依然不销毁组件,保存组件的实例在内存中,再次渲染时可以利用缓存的组件实例。
    - 大量实例不销毁,保存在内存中,存在内存泄漏的风险,要调用deactivated销毁。

- 减少体积
  - Tree Shaking：webpack4.x 默认支持，基于ES6的modules，要设置 modules: false 避免转为commonjs规范。
  - gzip压缩：效果 Content-Encoding：gizp，文件大小降为30%。服务器nginx设置压缩比等 或者 前端安装compression-webpack-plugin，再配置productionGzip，构建时生成.gz 文件，服务器就无须再压缩。一般图片不压缩。
    - nginx
    ```
    // nginx的配置方式
    http {
      gzip on;
      gzip_static on;
      gzip_min_length 1024;
      gzip_buffers 4 16k;
      gzip_comp_level 2;
      gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php application/vnd.ms-fontobject font/ttf font/opentype font/x-woff image/svg+xml;
      gzip_vary off;
      gzip_disable "MSIE [1-6]\.";
    }
    ```
    - 前端：config/index.js里有一个productionGzip设置为true，前端进行gzip压缩生成.gz 文件。nginx的gzip_static设为on，就直接使用同名.gz文件，不用占用服务器CPU资源自己压缩。
    - express：
    ```
    npm i express compression

    // serve.js
    var express = require('express')
    var app = express()

    // 开启gzip压缩,如果你想关闭gzip,注释掉下面两行代码，重新执行`node server.js`
    var compression = require('compression')
    app.use(compression())

    app.use(express.static('dist'))
    app.listen(3000,function () {
      console.log('server is runing on http://localhost:3000')
    })

    node server.js
    ```

  - CDN：剥离第三方库依赖（vue、element-ui）放在cdn如 jsDelivr，在html中通过script引入，不会被打包到代码文件vendor.js中，减少包的体积，降低自己服务器压力，CDN提升依赖加载速度。【如vue、vue-router、vuex、element-ui和axios】，使用CDN后卸载对应npm包【npm uninstall ...】
    - 将依赖的vue、vue-router、vuex、element-ui和axios这五个库，改为通过CDN链接获取。借助HtmlWebpackPlugin,可以方便的使用循环语法在index.html里插入js和css的CDN链接。
    ```js
    <!-- CDN文件，配置在config/index.js下 -->
    // config/index.js
    module.exports = {
      build: {
        cdn: {
          css: [
            "https://unpkg.com/element-ui/lib/theme-chalk/index.css",
          ],
          js: [
            "https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.min.js",
            "https://cdn.jsdelivr.net/npm/vue-router@3.0.1/dist/vue-router.min.js",
            "https://cdn.jsdelivr.net/npm/vuex@3.0.1/dist/vuex.min.js",
            "https://unpkg.com/element-ui/lib/index.js",
            "https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.min.js"
          ]
        }
      }
    }

    // build/webpack.prod.conf.js

    new HtmlWebpackPlugin(Object.assign(
      { ... },
      config.build.cdn
    )),
    ```
    ```html
    // index.html - 通过模板引入循环插入html
    <head>
      <% for (var i in htmlWebpackPlugin.options.css) { %>
      <link href="<%= htmlWebpackPlugin.options.css[i] %>" rel="stylesheet">
      <% } %>
    </head>
    <body>
      <% for (var i in htmlWebpackPlugin.options.js) { %>
      <script src="<%= htmlWebpackPlugin.options.js[i] %>"></script>
      <% } %>
    </body>

    ```
    - 在build/webpack.prod.conf.js中添加如下代码,使用CDN引入外部文件的情况下，依然可以在项目中使用import的语法来引入这些第三方库，也就意味着你不需要改动项目的代码，这里的键名是import的npm包名，键值是该库暴露的全局变量。
    ```js
    // build/webpack.prod.conf.js
    externals: {
      'vue': 'Vue',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'element-ui':'ELEMENT',
      'axios':'axios'
    }
    ```

  - 动态加载 ES6 代码：ES6意味着不用经过Babel转译，体积更小，性能更好，`<script type="module">`这个标签来判断浏览器是否支持 es6。

- 预渲染&服务端渲染
  - 预渲染：插件prerender-spa-plugin，预渲染静态 html 内容，构建过程中，本地模拟开启页面，捕获内容并输出html文件，放在指定路由同名的文件夹，访问时返回对应的已渲染好的index.html文件，适合静态内容多的页面。
    - router设为history模式，然后安装插件
    ```
    npm i prerender-spa-plugin --save-dev

    ```
    - 添加配置，定义需要预渲染的路由
    ```js
    //  build/webpack.prod.conf.js 
    const PrerenderSPAPlugin = require('prerender-spa-plugin')
    ...
    new PrerenderSPAPlugin({
      staticDir: config.build.assetsRoot,
      routes: [ '/', '/Contacts' ], // 需要预渲染的路由（视你的项目而定）
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true,
        sortAttributes: true
      }
    })
    ```
    - 调整main.js
    ```js
    // 激活静态HTML，使他们成为动态的，可根据后续数据变化调整。
    // 强制使用应用程序的激活模式
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app', true)
    ```
  - SSR服务端渲染(nuxt.js)

## 运行时
> 高性能要求的场景，优化代码执行速度，主要分为动画优化、减少回流重绘、减少内存泄漏、长列表优化、多线程运行。

### 渲染原理介绍

- 展示总体步骤
![performance-render1](./img/performance-render1.jpg)
  - JS实现动画或新增DOM -> Style计算样式 -> Layout进行布局计算位置 -> Paint绘制 -> Composite渲染层合并

- Composite详细流程
![performance-render](./img/performance-render.png)
  - Nodes 到 LayoutObjects(布局对象)
    - 每个 Node 节点都有一个对应的 LayoutObject，保存样式位置信息，构成一个树。
  - LayoutObjects 到 PaintLayers(渲染层)
    - 根据层叠上下文的位置创建新渲染层，也有特殊情况会创建新的渲染层。
  - PaintLayers 到 GraphicsLayers(图形层)
    - 合成层拥有独立的图形层，其他渲染层公用一个图形层。每个图形层会生成位图，交给GPU将多个位图合成， 然后展现在屏幕上。
  - 层压缩
    - 大量合成层消耗内存，影响性能，所以浏览器会进行自动层压缩，但有些是压缩不了的。

### 提升动画性能
- 动画的三种实现方式
  - CSS3
  - Canvas + JS
  - DOM + JS (非常容易引起回流重绘，尽量避免)

- CSS动画优化
  - 原则：
    - 尽量将动画提升为一个独立图层(合成层)，避免动画效果导致重绘影响其他渲染层的元素
    - 尽量利用GPU硬件加速(提示为合成层也就会用到硬件加速啦)
    - 尽量避免回流和重绘，除了常规的避免，在合成层上使用transform 和 opacity也不会导致回流重绘。
  - 提升为合成层的较好的两种方式：
    - CSS 的 will-change 属性。will-change 设置为 opacity、transform、top、left、bottom、right（其中 top、left 等需要设置明确的定位属性，如 relative 等）
    ```css
    #target {
      will-change: transform;
    }
    ```
    - 如不支持，使用3D transform属性强制提升。
    ```css
    #target {
      transform: translateZ(0);
    }
    ```

  - 提升为合成层好处：
    - 合成层的位图会交给GPU合成，速度比CPU快
    - 需要重绘时，只重绘自身，不会影响其他层
    - 可以使用 transform 和 opacity 实现动画效果，不会引发回流重绘，在其他渲染层就会。
  - 查看合成层
    - 简单：DevTools，勾选上 Layer Borders
    - 详细：More Tools，添加 Layers 选项卡
    - 可关注 Composite渲染层合并的时间来优化合成层的数量。
    ![查看合成层](./img/Per-Composite.png)
  - 硬件加速原理：
    - 让容器有自己的独立合成层，由GPU直接处理。
  - 硬件加速开启方式：
    - will-change
    - 3D transform
    - video 元素
    - backface-visibility 为 hidden的元素(翻转后背面不可见)
    - ...
  - 硬件加速优缺点：
    - 建议：只在需要的情况下开启，不要滥用
    - 优点：提高渲染速度
    - 缺点：额外内存消耗，耗电量增加

- Canvas动画优化
  - 使用requestAnimationFrame替代setInterval来做动画循环
  - 使用web worker分担主线程压力，解决大量数据计算，大量DOM操作的卡顿问题




### 减少回流重绘
- 重排（回流）：节点尺寸需要重新计算，重新排列元素，引起局部或整个页面重新渲染
- 重绘：样式发生变化，更新外观内容
- 重绘不一定出现重排
- 重排一定会出现重绘

#### 如何触发
- display: none隐藏一个DOM节点 -> 回流和重绘
- visibility: hidden隐藏一个DOM节点 -> 重绘
- 增加、删除、更新dom
- 移动dom或者动画
- 调整窗口大小

#### 如何优化
- 集中改变样式
    - 改变class（类名）的方式
        ```js
        // 判断是否是黑色系样式
        const theme = isDark ? 'dark' : 'light'
        // 根据判断来设置不同的class
        ele.setAttribute('className', theme)
        ```
- 离线操作dom：DocumentFragment
    - createDocumentFragment在dom树之外创建游离节点，该节点上批量操作，再插入dom，一次重排
        ```js
        var fragment = document.createDocumentFragment();
        for (let i = 0;i<10;i++){
          let node = document.createElement("p");
          node.innerHTML = i;
          fragment.appendChild(node);
        }
        document.body.appendChild(fragment);
        ```
- 提升至合成层
    - CSS 的 will-change  
        ```css
        #target {
          will-change: transform;
        }
        ```
    - 重绘时只会影响合成层，不会影响其它层
    - transform 和 opacity 效果，不会触发 layout 和 paint
    
### 减少内存泄漏
- [参考](https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng==&mid=2247496779&idx=2&sn=892d968a86ebd083582ae2e28f48ab8f&chksm=f9524108ce25c81e960471a63357cf2bc59971e2a22ca9549f67c5266100474712fcaa208f28&mpshare=1&scene=1&srcid=&sharer_sharetime=1592813500572&sharer_shareid=f72feefcc9c2c137677aa7f49d02e0f4&key=5275bdb85f6fecb5b863a0f4364938b0f20d3068a623c70bb17408602e09ad9840bc8824054c5f5f3e8b5fdacdf41cf6d13413049806b41cdb497e6abe7e48742dabb92c99874d17f7c19bace4019ecd&ascene=1&uin=MjI1NjQ0MTU1&devicetype=Windows+7+x64&version=62090523&lang=zh_CN&exportkey=AZvo2t51y73c8EhAeN7gjAk%3D&pass_ticket=KfXN%2BILZIw36ijjDu%2F7KSM38UJxJ2Cjf8FTYPf6jp%2Fg%3D)

- 查看内存泄露： 
  - Chrome 中的 Performance 面板，可视化查看内存的变化情况，找出异常点。
  ![JS-heap-check](./img/JS-heap-check.png)
    - 打开开发者工具，选择 Performance 面板
    - 在顶部勾选 Memory
    - 点击左上角的录制按钮Record。
    - 在页面上进行各种操作，模拟用户的使用情况。
    - 一段时间后，点击对话框的 stop 按钮，面板上就会显示这段时间的内存占用情况。
    - 关注JS Heap，看到起点不断增高而没有释放内存，可能出现异常，点击预览图蓝色线增高点，看看执行了什么操作。去对应的函数中排查代码。

  - Chrome 中的 Memory 面板，可查看活动的Javascript对象（以及DOM节点）在内存中的分布
  ![JS-heap-2](./img/JS-heap-2.png)
    - Heap snapshot 堆快照，可截操作前后的内存快照，进行对比分析。
    - on timeline 时间线，可开始录制操作，执行一段操作，选择内存增大的时间点分析。

- [分析Chrome性能调试工具Timeline简介](https://www.jianshu.com/p/f27b27167125)

> 下面是可能导致内存泄漏的情况及预防

- 滥用全局变量: 如未声明的变量，在函数中滥用this指向全局对象，无法被回收
  - 预防：使用严格模式（"use strict"）
- 闭包(返回子函数): 父执行完后，子函数中引用父的变量无法被释放，导致引用的变量被保留。
  - 预防：会用到，但要知道何时创建，保留哪些对象
- 定时器: 未被正确关闭，导致所引用的外部变量无法被释放
  - 预防：必要时销毁定时器如clearInterval
- 事件监听: 没有正确销毁，如使用监听执行匿名内联函数，无法使用removeEventListener() 将其删除
  ```js
  document.addEventListener('keyup', function() { 
    doSomething(hugeString); 
  });
  ```
  - 预防：
    - 将执行函数的引用传递进removeEventListener，来注销事件监听。
    - 还可以使用addEventListener() 第三个参数`{once: true}`，在处理一次事件后，将自动删除侦听器函数。
    ```js
    function listener() {
      doSomething(hugeString);
    }
    document.addEventListener('keyup', listener); 
    document.removeEventListener('keyup', listener); 
    ```
- DOM 引用: 在全局中对DOM节点的直接引用，删除该DOM节点，也不会被垃圾回收
  ```js
  function createElement() {
    const div = document.createElement('div');
    div.id = 'detached';
    return div;
  }
  const detachedDiv = createElement();
  document.body.appendChild(detachedDiv);
  // this will keep referencing the DOM element even after deleteElement() is called
  ```
  - 预防：
    - 使用弱引用WeakSet 和 WeakMap 保存 DOM 的引用
    - 将对DOM的引用移入函数局部作用域，函数使用完，局部变量对DOM的引用被销毁。
  ```js
  function createElement() {...} 
  function appendElement() {
      const detachedDiv = createElement(); // DOM的引用放在函数内
      document.body.appendChild(detachedDiv);
  }
  appendElement();
  ```

### 大数据长列表性能

> 前端渲染大量数据上千行，不允许分页情况下，容易导致卡顿，掉帧现象。

- 解决方案：
  - 虚拟列表 - 只渲染可视区域的数据
  - 时间分片 - 使用 setTimeout 拆分密集型任务
  - Web Worker - 与主线程并行的独立线程，通过 onmessage 和 postMessage 接口进行通信，完成大量的数据计算，结果返回主线程，由主线程更新DOM元素。
  - 触底请求分页+节流优化滚动(允许分页请求条件下)

- 常见场景：
  - 插件关联时：不选择对应品类的话，会展示所有品类的全部版本插件，每个插件可能是几十上百个版本，所有品类最多可上万条版本数据供关联。

#### 长列表渲染-虚拟列表
- 原因：DOM元素的创建和渲染时间成本很高,大数据完整渲染列表比较慢。
- 场景：适用复杂情况的列表item，如element-ui组件
- 原理：从总数据取一部分数据，只对「可见区域」进行渲染，不可见部分不渲染。
- 步骤：基于Vue
- item高度相同同情况下：
    - 创建容器：在容器中创建两块元素，一个是真实可视列表，一个是不可见的元素撑开列表，使用计算属性根据列表数据计算这个不可见元素整个高度，占位让列表滚动条出现。computed:{ contentHeight() { return this.data.length * itemHeight + 'px' } }
    -  监听滚动：scrollTop表示已滚出屏幕的高度。监听最外的容器滚动：@scroll="handleScroll" 
    -  执行更新：计算高度const scrollTop = this.$el.scrollTop; 再执行下面update(scrollTop)方法，更新可视区域数据。
        - 计算可视区域放数据的个数const visibleCount = Math.ceil(this.$el.clientHeight / this.itemHeight); 
        - 计算可视区域的起始item坐标start （比如0）const start = Math.floor(scrollTop / this.itemHeight); 向下取整
        - 计算可视区域的结束item坐标end （比如10） const end = start + visibleCount;
        - 取出需要显示的数据，并更新渲染 this.visibleData = this.data.slice(start, end);
        - 把可见区域的 top 设置为起始元素在整个列表中的位置，也就是向下滚动 this.$refs.content.style.transform = `translateY(${ start * this.itemHeight }px)`;

-  item高度不同（动态高度）情况下：`Element.getBoundingClientRect`返回元素的大小和相对于视口的位置
    - 方案：传入预估高度属性先渲染部分数据，在**updated**钩子中，使用**getBoundingClientRect**获取每一个节点真实高度和top和bottom，存放在一个列表中维护，并缓存下来，根据和预估高度的差值，进行调整，然后使用偏移量执行向下移动。
        - 定义一个`props :estimatedItemSize` 预估高度
        - 定义一个`this.positions = [ {top:0,bottom:100,height:100} ,{...}] `保存每一项的高度及位置信息
        - 执行初始化，将预估高度保存入positions里，里面有高度、top、bottom
        - 列表总高度contentHeight：最后一项距离列表顶部的位置`this.positions[this.positions.length - 1].bottom;`
        - 渲染后，**获取真实位置并缓存**：在updated钩子里，遍历列表item的数组，获取每个node节点的高度**getBoundingClientRect.height**，与预估高度进行对比，如果有差值，进行bottom减去这个差值。height替换为新的height。更新所有后面的项位置。
        - 屏幕显示的数量visibleCount：`Math.ceil(this.screenHeight / this.estimatedItemSize);`
        - 查找起始item：遍历positions，找到bottom>scrollTop的第一项（bottom是从小到大递增的，这里可用二分法查找优化）
        - 偏移量offset：`this.offset = this.positions[this.start - 1].bottom`，再执行向下滚动this.$refs.content.style.transform = `translateY(${ offset }px)`
        - 查找结束坐标：`this.end = this.start + this.visibleCount`;
    - 滚动太快导致白屏的解决方案：
      - 可见区域的上方和下方渲染额外的项目，而不是刚好卡着屏幕能显示的数量。
      ```js
      visibleData(){
        let start = this.start - this.aboveCount;
        let end = this.end + this.belowCount;
        return this._listData.slice(start, end);
      }
      ```

### Web Worker多线程
现代浏览器为JavaScript创造的 多线程环境。**可以将复杂计算任务分配到worker线程并行运行，等worker完成计算任务，再将结果返回主线程**，两个线程可 独立运行，互不干扰，可通过自带的 **消息机制** 相互通信，为了节省系统资源，使用完毕记得关闭。

- 基本用法:
  - 主线程
    ```js
    const worker = new Worker('work.js') // 来自网络的js文件
    worker.postMessage('Hello World') //主线程传给 Worker 的数据
    worker.onmessage = function(event) { //监听函数，接收子线程发回来的消息
        console.log('Received message' + event.data)
    }
    // 错误监控
    worker.onerror(function (event) {
      console.log([
        'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
      ].join(''));
    });

    worker.terminate(); //任务完成，关闭
    ```
  - Worker线程(self代表子线程自身，即子线程的全局对象)
    ```js
    self.addEventListener('message', function (e) { // 监听message事件
      self.postMessage('You said: ' + e.data); // self.postMessage()方法用来向主线程发送消息。
    }, false);

    // 示例：
    self.addEventListener('message', function (e) {
      var data = e.data;
      switch (data.cmd) {
        case 'start':
          self.postMessage('WORKER STARTED: ' + data.msg);
          break;
        case 'stop':
          self.postMessage('WORKER STOPPED: ' + data.msg);
          self.close(); // self.close()用于在 Worker 内部关闭自身。
          break;
        default:
          self.postMessage('Unknown command: ' + data.msg);
      };
    }, false);

    // 加载其他脚本：
    importScripts('script1.js', 'script2.js');
    ```
- API
主线程
```js
Worker.onerror：指定 error 事件的监听函数。
Worker.onmessage：指定 message 事件的监听函数，发送过来的数据在Event.data属性中。
Worker.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
Worker.postMessage()：向 Worker 线程发送消息。
Worker.terminate()：立即终止 Worker 线程。
```
Worker
```js
self.name： Worker 的名字。该属性只读，由构造函数指定。
self.onmessage：指定message事件的监听函数。
self.onmessageerror：指定 messageerror 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
self.close()：关闭 Worker 线程。
self.postMessage()：向产生这个 Worker 线程发送消息。
self.importScripts()：加载 JS 脚本。
```
- 优势：
    - 能够执行处理器密集型的运算而不会阻塞 UI 线程。
- 限制:
    - 同源限制：与主线程的脚本同源
    - DOM限制：无法使用 document / window / alert / confirm
    - 文件限制：无法读取本地资源




#### 长列表渲染-时间切片
- 原因：DOM元素的创建和渲染时间成本很高,大数据完整渲染列表比较慢。
- 场景：大量简单的dom 
- 原理：延时加载，setTimeout（回调与系统刷新不一致会有闪屏现象）或window.requestAnimationFrame进行分批渲染
- window.requestAnimationFrame(回调函数执行与浏览器刷新频率保持一致，通常是每秒60次，更优)下次重绘之前继续更新下一帧动画
- FPS表示每秒钟画面更新次数，大多数显示器的刷新频率是60Hz，相当于每秒钟重绘60次，人眼睛有视觉停留效应，间隔时间太短16.7ms（1000/60 ms）让你以为屏幕的图像是禁止的。 50 ～ 60 FPS 的动画将会相当流畅，帧率在 30 FPS 以下的动画，明显的卡顿和不适感；
- 实现：
```html
<div>
    <ul id="container"></ul>
 </div>
<script type="text/javascript">
    let ul = document.getElementById('container');
    // 总数
    let total = 50000;
    // 一次插入 20 条
    let once = 20;
    // 每条记录的索引
    let index = 0;
    
    //循环加载数据
    function loop(curTotal,index) {
      if(curTotal <= 0) {
        return false;
      }
      //每页多少条
      let pageCount = Math.min(curTotal, once);
      window.requestAnimationFrame( function() {
          for(let i = 0;i<pageCount;i++) {
            let li = document.createElement('li');
            li.innerText =index +  ":"+ i + ":" + ~~(Math.random()*total);
            ul.appendChild(li);
          }
          // 添加下一批数据
          loop(curTotal - pageCount,index + pageCount);
        }
      )
    }
    
    loop(total,index);
</script>
```

## Vue项目优化

### 加载时
- 预渲染(Prerender)或服务端渲染(SSR)
  - 参考上方

### 运行时

- 指令场景
  - v-if(条件渲染)用在条件较少改变的场景，v-show(display切换)用在频繁切换的场景
  - v-for遍历要加key(提高diff速度)，v-for遍历避免同时使用v-if(v-for比v-if优先级高，每次都会遍历)
  - computed用于进行依赖数值的计算，有缓存。用watch用于执行监听数据变化后的回调，可异步。

- Object.freeze()冻结对象

  - 阻止了Vue使用数据劫持（用 Object.defineProperty 重写setter和getter）
  - 因为冻结后，不能添加、删除、修改属性值，不能修改可写性、可枚举性等。
  - 适合只是展示的场景，数据不会改变，如大数据表格。
  ```js
  export default {
    data() {
      return {
        users: {}
      }
    },
    async created() {
      const users = await axios.get("/api/users");
      this.users = Object.freeze(users);
    }
  };
  ```

- 扁平化接口返回的数据
  - JSON数据规范化（normalize），将深层嵌套的 JSON 对象通过定义好的 schema 转变成使用 id 表示的对象，如用户user数组集中使用id来存放信息，在评论也是写上id即可表示是哪个用户评论，快速在user数组即可找到这个用户的信息。

- 路由懒加载
  - 参考上方
- 组件级别懒加载
  - 参考上方
- 虚拟列表
  - 参考上方

- 启用Vue的生产环境模式 【Vue CLI默认开启】
  - Vue 源码会根据 process.env.NODE_ENV 决定是否启用生产环境模式，同时构建过程的警告也会被压缩工具去除。
  ```js
  // webpack4 + 使用mode选项配置production
  module.exports = {
    mode: 'production'
  }
  ```
- 使用单文件组件(.vue)预编译模板 【Vue CLI默认开启】
  - 写好的代码自动预编译，包含编译好的渲染函数而不是模板字符串。
- 提取组件的CSS 【Vue CLI默认开启】
  - 单文件组件时，组件内的 CSS 会以 `<style>` 标签的方式通过 JavaScript 动态注入，使用插件extract-text-webpack-plugin + `vue-loader`将所有组件的CSS提取到一个文件中。
  ```js
  // webpack.config.js
  var ExtractTextPlugin = require("extract-text-webpack-plugin")

  module.exports = {
    // other options...
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: true
          }
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("style.css")
    ]
  }
  ```