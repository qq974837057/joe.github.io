## 前端安全

### XSS：跨站脚本攻击

- 如何攻击：在 URL 或者页面输入框中插入恶意 JS 代码，用户访问时完成攻击，如获取 cookie、监听用户按键等。
- 存储型：将恶意代码存入服务器的数据库，如发表文章、评论、设置标题等，用户访问页面该内容即会触发，比较危险。属于服务端的安全漏洞。是持久化的。
- 反射型：恶意代码存在 URL 上，如带参数的搜索，钓鱼邮件引诱点击 URL，服务器取出恶意代码并拼在 HTML 中返回浏览器，属于服务端的安全漏洞。是非持久化的。
- DOM 型：构造包含恶意代码的 URL，前端取出 URL 的恶意代码，不小心地执行了该代码，获取用户数据，调用相关接口，属于前端代码漏洞。

```html
<!-- 链接内包含恶意代码 -->
<a href="代码">1</a>

<script>
  // setTimeout()/setInterval() 中调用恶意代码
  setTimeout("恶意代码");
  setInterval("恶意代码");
  // location 调用恶意代码
  location.href = "恶意代码";
</script>
```

- 反射型 XSS 跟存储型 XSS 的区别：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。
- DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞。
- 防范
  - 设置 HttpOnly ：禁止 JS 读取`document.cookie`，解决 XSS 后的 Cookie 劫持攻击。
  - 输入过滤：检查用户输入的数据，过滤非法值或者编码再存入服务器（style 节点，script 节点，iframe 节点），可用开源的一些 XSS Filter。
  - 输出转码：输出到 HTML 页面时，潜在威胁的字符`& < > " ' /`进行 HTMLEncode 编码、转义
  - 限定输入内容的长度：增加 XSS 攻击难度
  - DOM 型：避免拼接字符串传入一些 API，导致代码执行。不要把不可信的数据作为 HTML 插到页面上，例如不使用 v-html。

### CSRF/XSRF: 跨站请求伪造

- 如何攻击：攻击者通过访问第三方黑客网站，通过 get 方式(图片链接 src)、post 方式(自动提交的表单)发送跨站请求，利用凭证 cookie，请求用户已登录的网站接口，执行恶意操作（只借用 cookie，不能获取）
- 防范 1：阻止不明外域的访问
  - `Samesite=Strict`: Set-Cookie 时将同站 cookie 属性设为严格模式，表明这个 Cookie 在任何情况下都不能作为第三方 Cookie。比如，在极客时间的⻚⾯中访问 InfoQ 的资源，⽽ InfoQ 的某些 Cookie 设置了 SameSite = Strict 的话，那么这些 Cookie 是不会被发送到 InfoQ 的服务器上的。只有你从 InfoQ 的站点去请求 InfoQ 的资源时，才会带上这些 Cookie。
  - 同源检测：请求 header 里的`Origin`和 `Referer` 字段，服务器判断发起请求的来源地址，校验是否合法。Origin 和 Referer 的区别就是 Origin 只包含域名信息，而 Referer 包含域名+路径信息
- 防范 2：提交时要求附加本域才能获取的信息
  - 服务器生成 CSRF token（常用）：服务器根据用户信息 哈希算法生成 token 字符串 发给前端，前端存储在 localStorage 中，再次请求时前端请求头带上 token，服务端验证 token 是否正确（请求头可通过拦截器在接口调用时添加 token），一次性有效 token，每次接口校验完返回新 token。
  - 双重提交 Cookie：用户访问后，返回一个随机字符串注入 cookie，下次请求时取出，添加到 URL 参数上，验证与 cookie 是否一致。
  - 输入验证码：明确当前是本人操作的，用户体验差。

### 使用沙箱安全的执行用户 js 代码

- eval 和 new Function 这两个方法会在当前的 Context 中运行，它们可以访问 cookie 等隐私数据，所以不能使用这两个方法：

```js
const cookie = eval("document.cookie");
const getCookie = new Function("return document.cookie");
```

- 所以，我们要将用户脚本放到**沙箱（Sandbox）中去运行**，同时不能让它们访问任何用户数据，比如 cookie、localStorage、JavaScript 全局变量、DOM 元素等。

### 网络劫持

- http 劫持（明文修改响应，加广告）：全站 HTTPS，将 HTTP 加密，这使得运营商无法获取明文，就无法劫持你的响应内容

### JSON 劫持(JSON Hijacking)

- 属于 CSRF 范畴
- 通过已认证过的凭证，构造 jsonp 执行跨域请求，获取数据执行回调，将数据通过 new Image 的方式发送到攻击者的服务器上。造成信息泄露。
- 防御：
  - API 设置为 post，因为 jsonp 只能 get
  - 检查请求头表示有 ajax 发起的请求`X-Requested-With:XMLHttpRequest`
  - 请求的参数加上与后端约定好的签名（带上时间戳）
