## 前端错误监控体系

- [错误监控参考](http://jartto.wang/2018/11/20/js-exception-handling/)

- 前端监控有几种类型
  - 行为监控(PV/UV,埋点接口统计)
  - 异常监控
  - 性能监控
- 一个监控系统有几个阶段
  - 日志采集
  - 日志存储
  - 统计与分析
  - 报告和警告

异常影响程序的正确运行，导致页面显示异常或白屏，用户操作被阻塞，非常影响用户体验。所以我们要理解异常，学会处理异常。

### 公司 sentry 的脚本接入

- 不同框架接入形式略有不同，大体上步骤一致
  - sentry 管理官网创建一个项目，复制上报地址 URL:xxx
  - 新增一个 sentry-integration.ts 文件
  - 里面进行 `Sentry.init({dsn:xxx})` 进行初始化
- 缺点
  - 无法查看源代码
  - 错误信息杂乱，无分类，定位问题慢
  - 部分错误缺失监控，如接口错误
  - 邮件上报频繁
- 优化方案
  - 项目构建时增加 sourcemap 上传
  - 增加标签分类
  - 改写错误上报方法
  - 修改邮件发送规则

### 异常分类

- 异常类型

  - JS 语法错误
  - 静态资源加载异常
  - Promise 异常
  - 框架的异常
  - 接口请求异常
  - 跨域
  - 页面奔溃

- 错误对象 Error 种类
  - Error：错误的基类，其他错误都继承自该类型，主要用于开发者自定义错误
  - InternalError：引擎抛出异常，比如递归太多导致栈溢出
  - EvalError：Eval 函数执行异常
  - RangeError：数组越界
  - ReferenceError：访问不存在的变量
  - SyntaxError：语法解析不合理
  - TypeError：类型错误、访问不存在的方法
  - URIError：使用`encodeURI()`、`ecodeURI()`传入错误格式的 URI
  - 使用
    - 可以使用`error instanceof xxxError`来确定是什么类型的错误
    - 可以使用`throw new xxxError("message")`来抛出错误

### 异常处理方式

- 总结
  - `try-catch`：包裹可能出错的代码
  - `window.onerror`：全局捕获错误
  - `addEventListener 捕获阶段`：捕获全局资源加载错误
  - `unhandledrejection`： 捕获 未 catch 的 Promise
  - `Vue.config.errorHandler`：捕获 Vue 错误
  - `ErrorBoundary 边界错误`：捕获 React 组件错误
  - `axios 的 interceptors 拦截器` ：捕获请求错误

1. 可能出错的代码使用`try-catch`：可以查看错误信息`error.message`，捕获同步的运行时的错误，但不能捕获异步错误。try-catch 适合于自己无法控制的错误，如果明确知道会错误，那么应该采取对应措施。

2. 全局监控 JS 运行异常`window.onerror`：捕获预料之外的错误：` window.onerror` 可捕获同步+异步，语法错误和静态资源捕获不到

```js
window.onerror = function (message, source, lineno, colno, error) {
  console.log("捕获到异常：", { message, source, lineno, colno, error });
  //message:错误消息 source：脚本URL line/column：行列号 error：错误对象
};
```

3. 全局静态资源异常和网络请求异常，error 不会冒泡，使用捕获阶段（第三个参数设置为 true）监听` window.addEventListener('error',(error)=>{},true)`，但无法判断 HTTP 状态码

4. 捕获没有 catch 的 Promise 异常：监听 `unhandledrejection`

```js
window.addEventListener("unhandledrejection", function (e) {
  e.preventDefault();
  console.log("捕获到 promise 错误了");
  console.log("错误的原因是", e.reason);
  console.log("Promise 对象是", e.promise);
  return true;
});
```

5. Vue 异常捕获

- 捕获 error： `Vue.config.errorHandler(err, vm, info)`

  ```js
  Vue.config.errorHandler = function (err, vm, info) {
    //err指代error对象，info是一个Vue特有的字符串，vm指代Vue应用本身。
    console.log(`Error: ${err.toString()}\nInfo: ${info}`);
  };
  ```

  ```js
  // weex中的错误监控
  Vue.config.errorHandler = function (err, vm, info) {
    let errObj = {
      path: weex.config.bundleUrl,
      errDesc: err.toString(),
      errDetail: JSON.stringify(err),
      info: info,
    };
    let errMsg = "执行时错误信息: \n" + JSON.stringify(errObj, null, 4);
    console.error(errMsg);
  };
  ```

- 捕获 warning： `Vue.config.warnHandler(msg, vm, trace)` //trace 表示组件树，生产环境不可用

6. React 异常捕获：错误边界组件

   > 错误边界是一种 React 组件，这种组件可以捕获并打印发生在其子组件树任何位置的 JavaScript 错误，并且，它会渲染出备用 UI，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。

- 如何编写组件

  - 使用 componentDidCatch() 变成一个错误边界，可以用它打印错误信息
  - 使用 static getDerivedStateFromError() 渲染备用 UI

    ```js
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        // 你同样可以将错误日志上报给服务器
        logErrorToMyService(error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          // 你可以自定义降级后的 UI 并渲染
          return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
      }
    }
    ```

- 如何使用

  - 错误边界的粒度自我把控，可以包装在最顶层，也可以包装在单独页面组件。

    ```js
    <ErrorBoundary>
      <MyWidget />
    </ErrorBoundary>
    ```

- 注意
  - 错误边界只针对 React 组件
  - 只有 class 组件才可以成为错误边界组件
  - 错误边界仅可以捕获其子组件的错误
- 错误边界无法捕获的错误
  - 事件处理：使用普通的 JavaScript try / catch 语句
  - 异步代码
  - 自身的错误(非子组件)
  - 服务端渲染

7. Axios 请求统一异常处理用拦截器 interceptors

   ```js
   axios.interceptors.response.use(
     function (response) {
       // Any status codes that falls outside the range of 2xx cause this function to trigger
       // Do something with response error
     },
     // 错误处理
     function (error) {
       if (error.response.status === 401) {
         goLogin(); // 跳转登录页
       } else if (error.response.status === 502) {
         alert(error.response.data.message || "系统升级中，请稍后重试");
       }
       return Promise.reject(error.response);
     }
   );
   ```

8. 监听 AJAX

- [知乎参考](https://zhuanlan.zhihu.com/p/73397401)
- 用途
  - 我们要监控接口报错的情况，及时定位线上问题产生的原因
  - 我们要分析接口的性能，以辅助我们对前端应用的优化。
- 本质
  - 封装的请求库都是对浏览器的这个对象 window.XMLHttpRequest 进行了封装
  - 可以监听 XMLHttpRequest 对象的两个事件 loadstart 和 loadend，基于这两个事件封装抛出 new CustomEvent 自定义事件 ajaxLoadStart 和 ajaxLoadEnd，在 ajax 触发时进行事件派发 dispatchEvent。
- 注意
  - 一个页面上会有很多个请求，当一个页面发出多个请求的时候，ajaxLoadStart 事件被监听到，但是却无法区分出来到底发送的是哪个请求，只返回了一个内容超多的事件对象，而且事件对象的内容几乎完全一样。当 ajaxLoadEnd 事件被监听到的时候，也会返回一个内容超多的时间对象，这个时候事件对象里包含了接口请求的所有信息。幸运的是，两个对象是同一个引用，也就意味着，ajaxLoadStart 和 ajaxLoadEnd 事件被捕获的时候，他们作用的是用一个对象。那我们就有办法分析出来了。
  - 当 ajaxLoadStart 事件发生的时候，我们将回调方法中的事件对象全都放进数组 timeRecordArray 里，当 ajaxLoadEnd 发生的时候，我们就去遍历这个数据，遇到又返回结果的事件对象，说明接口请求已经完成，记录下来，并从数组中删除该事件对象。这样我们就能够逐一分析出接口请求的内容了。

9. Script error 表示跨域（加载自不同域的脚本）

- 为 script 标签添加 crossOrigin 属性
- 服务器设置 Access-Control-Allow-Origin：\* 响应头

10. 监控网页奔溃：window 对象的 load 和 beforeunload

    ```js
    window.addEventListener("load", function () {
      sessionStorage.setItem("good_exit", "pending");
      setInterval(function () {
        sessionStorage.setItem("time_before_crash", new Date().toString());
      }, 1000);
    });

    window.addEventListener("beforeunload", function () {
      sessionStorage.setItem("good_exit", "true");
    });

    if (
      sessionStorage.getItem("good_exit") &&
      sessionStorage.getItem("good_exit") !== "true"
    ) {
      /*
            insert crash logging code here
        */
      alert(
        "Hey, welcome back from your crash, looks like you crashed on: " +
          sessionStorage.getItem("time_before_crash")
      );
    }
    ```

### 异常上报

常用的监控系统：Sentry、fundebug、BadJS。

常见错误(埋点)上报方式有：

- `navigator.sendBeacon(url, data);`通过 HTTP 将少量数据**异步传输**到 Web 服务器
- 动态创建 img 标签的形式（简单常用 1x1 的透明 GIF）
  - 使用
    ```js
    (new Image()).src = 'http://baidu.com/tesjk?logs=error'(?后加信息)
    ```
  - 优点
    - 无跨域问题，不需要操作 dom
    - 兼容性好，所有浏览器都支持 Image 对象
    - 不容易出错，如果使用第三方库有问题，那么错误无法发出
    - 1X1 最小合法图片
    - gif 支持透明，且体积最小为 43 字节
- 通过 Ajax 发送数据(get/post)
  - 一般打点域名不是当前域名，容易造成跨域
- 通过请求其他文件
  - 要插入 dom 才发请求，性能不好
  - 加载资源会阻塞页面渲染
- 采集率设置

  ```js
  Reporter.send = function (data) {
    // 采集率 30% 避免收集太多条
    if (Math.random() < 0.3) {
      send(data); // 上报错误信息
    }
  };
  ```

- [方式总结](https://toutiao.io/posts/xpy6p8/preview)

### 区分重大错误

- 如果属于非重大错误，不需要中断用户体验，判断如下
  - 不会影响主要任务
  - 页面的某个部分
  - 重复操作可以成功
- 如果属于重大错误，立即告知用户，或提供刷新页面的按钮
  - 无法运行
  - 影响主要任务
