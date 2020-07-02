## 概述
- 前端应用最影响性能的是加载速度，直接影响用户体验。
- 大部分页面需要2秒内完成加载，超过3秒，接近40%的用户离开网站。
- 所以优化方向就是让用户觉得加载得快！不仅包括加载指标速度的提升，还包括提高用户的体验，如有趣的loading或顺畅的骨架屏会让用户感觉并没有等太久。

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
  - 手动：Chrome面板
    - Performance的Timings一栏：查看FP、FCP、FMP
    - Performance的Main一栏：Recalculate Style：样式计算。Layout：布局位置。
    - Performance的Frames查看FPS帧率，水平线越低且持续时间长，代表画面卡顿。
    - Show Rendering：勾选FPS，可查看帧率和GPU内存使用情况
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
  - navigator.sendBeacon(url, data);通过HTTP将少量数据异步传输到Web服务器(不支持IE)
  ```js
  window.addEventListener('unload', logData, false);
  function logData() {
      navigator.sendBeacon("/log", analyticsData);
  }
  ```
  - 或者使用new Image()方式自动get请求，进行降级上报。
- 注意：
  - 白屏时间可以通过FP、FCP来粗略代替，精确则使用window.performance.timing。
  - SPA通过window.performance.timing，只是首次加载的数据。改变URL实际不刷新页面，该API是无法获取子路由对应的页面相关时间。


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
    - console.time('1');fn();console.timeEnd('1');
  - 获取时间戳，然后相减。
    - Date.now(); 时间精度为 毫秒（10^-3）级别；
    - new Date().getTime();
    - +new Date();
  - 更精确的方案
    - 浏览器：window.performance.now()获取window.performance.timing.navigationStart到当前时刻的毫秒数，带小数点。performance.timing.navigationStart + performance.now() 约等于 Date.now()。
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
    - Node环境：process.hrtime.bigint()，直接通过两个 bigint 相减来计算差异。在 Node.js 程序中，优先选 process.hrtime，其次选 performance.now，最后才会是 Date.now。
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

- 客户端渲染&服务端渲染&预渲染
  - 客户端渲染：用户访问 url，请求 html 文件，前端根据路由动态渲染页面内容。关键链路较长，有一定的白屏时间；
  - 服务端渲染：用户访问 url，服务端根据访问路径请求所需数据，拼接成 html 字符串，返回给前端。前端接收到 html 时已有部分内容；
  - 预渲染：构建阶段生成匹配预渲染路径的 html 文件（注意：每个需要预渲染的路由都有一个对应的 html）。构建出来的 html 文件已有部分内容。不适合个性化、经常变化的内容使用预渲染。
![客户端渲染&服务端渲染&预渲染](./img/Per-SSR&Prerender.png)

## 加载时

### 首屏加载
> 首屏的加载速度很重要,过长的白屏会导致用户流失。

- 用户体验感知
  - 前置loading：插件html-webpack-plugin，白屏时展示loading图。
  - 骨架屏占位：插件vue-server-renderer，展示大体结构，视觉过渡流畅。

- 网络和缓存
  - HTTP2：二进制分帧、多路复用、头部压缩、服务端推送
  - 拆包+缓存策略：webpack 4.x 对SplitChunksPlugin插件进行拆包配置 + 强制缓存和协商缓存，将第三方库设置较长的强缓存时间

- 懒加载
  - 图片懒加载（vue-lazyload）原理：进入可视区域再加载图片
    - 使用：src换成v-lazy
    ```html
    <img v-lazy="/static/img/1.png">
    ```
  - 路由懒加载（不同路由组件分割代码块chunk，访问该路由才加载对应js）结合 Vue 的异步组件和 Webpack 的代码分割(Code Splitting)功能
    ```js
    const Foo = () => import('./Foo.vue')
    ```
  - 组件级别懒加载
  - 组件keep-alive
    - 在页面已经跳转后依然不销毁组件,保存组件的实例在内存中,再次渲染时可以利用缓存的组件实例。
    - 大量实例不销毁,保存在内存中,存在内存泄漏的风险,要调用deactivated销毁。

- 减少体积
  - Tree Shaking：webpack4.x 默认支持，基于ES6的modules，要设置 modules: false 避免转为commonjs规范。
  - gzip压缩：生成.gz文件。服务器nginx设置压缩比等 或者 前端配置compression-webpack-plugin，服务器就无须再压缩。一般图片不压缩。
  - CDN：加速拉取第三方库依赖（vue、element-ui）：剥离一些依赖 ，放在cdn如 jsdelivr，在html中通过script引入，不会被打包到代码文件，提升构建速度。配置externals。
  - 动态加载 ES6 代码：ES6意味着不用经过Babel转译，体积更小，性能更好，`<script type="module">`这个标签来判断浏览器是否支持 es6。
  - npm run build -- --report 查看打包后的大小

- 预渲染
  - 预渲染：插件prerender-spa-plugin，预渲染静态 html 内容，html 会在脚本执行完被捕获并输出index.html。
  - SSR服务端渲染(nuxt.js)

## 运行时
> 高性能要求的场景，优化代码执行速度。

### 动画性能
- 动画的三种实现方式
  - CSS3
  - Canvas + JS
  - DOM + JS (非常容易引起回流重绘，尽量避免)

- CSS动画优化
  - 原则：
    - 尽量将动画放在一个独立图层，避免动画效果导致重绘影响其他渲染层的元素
    - 尽量避免回流和重绘
    - 尽量利用GPU加速
  - 方法-提升为合成层：
    - CSS 的 will-change 属性。will-change 设置为 opacity、transform、top、left、bottom、right（其中 top、left 等需要设置明确的定位属性，如 relative 等）
    - 如不支持，使用3D transform属性强制提升，transform: translateZ(0);。
  - 合成层好处：
    - 需要重绘时，只重绘自身，不会影响其他层
    - transform 和 opacity 效果，不会回流重绘
    - 合成层的位图会交给GPU合成，速度比CPU快
  - 查看合成层
    - 简单：DevTools，勾选上 Layer Borders
    - 详细：More Tools，添加 Layers 选项卡
    - 可关注 Composite渲染层合并的时间来优化合成层的数量。
    ![查看合成层](./img/Per-Composite.png)

- Canvas动画优化
  - 使用requestAnimationFrame替代setInterval来做动画循环
  - 使用web worker分担主线程压力，解决大量数据计算，大量DOM操作的卡顿问题

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

-  item高度不同（动态高度）情况下：
    - 预估高度先渲染，再获取真实高度并缓存下来。
        - 定义一个props :estimatedItemSize 预估高度
        - 定义一个this.positions = [ {top:0,bottom:100,height:100} ,{...}] 保存每一项的高度及位置信息
        - 执行初始化，将预估高度保存入positions里，里面有高度、top、bottom
        - 列表总高度contentHeight：最后一项距离列表顶部的位置this.positions[this.positions.length - 1].bottom;
        - 渲染后，**获取真实位置并缓存**：在updated钩子里，遍历列表item的数组，获取每个node节点的高度**getBoundingClientRect.height**，与预估高度进行对比，如果有差值，进行bottom减去这个差值。height替换为新的height。更新所有后面的项位置。
        - 查找起始item：遍历positions，找到bottom>scrollTop的第一项（bottom是从小到大递增的，这里可用二分法查找优化）
        - 偏移量offset：this.offset = this.positions[this.start - 1].bottom，再执行向下滚动this.$refs.content.style.transform = `translateY(${ offset }px)`


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

- 启用Vue的生产环境模式 (Vue CLI默认开启)
  - Vue 源码会根据 process.env.NODE_ENV 决定是否启用生产环境模式，同时构建过程的警告也会被压缩工具去除。
  ```js
  // webpack4 + 使用mode选项配置production
  module.exports = {
    mode: 'production'
  }
  ```
- 使用单文件组件(.vue)预编译模板 (Vue CLI默认开启)
  - 写好的代码自动预编译，包含编译好的渲染函数而不是模板字符串。
- 提取组件的CSS (Vue CLI默认开启)
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
- Object.freeze()冻结对象
  - 冻结后，不能添加、删除、修改属性值，不能修改可写性、可枚举性等。
  - 阻止了Vue使用数据劫持，用 Object.defineProperty 重写setter和getter。
  - 适合展示类的场景，如大数据表格。
- 扁平化接口返回的数据
  - JSON数据规范化（normalize），将深层嵌套的 JSON 对象通过定义好的 schema 转变成使用 id 表示的对象，如用户user数组集中使用id来存放信息，在评论也是写上id即可表示是哪个用户评论，快速在user数组即可找到这个用户的信息。
- 组件级别懒加载
  - 思路：IntersectionObserver条件判断是否出现在屏幕(图片懒加载也使用过此API) + v-if 指令渲染组件 + 骨架屏触发屏幕条件判断(大体灰白结构)
- 虚拟列表
  - 参考上方
