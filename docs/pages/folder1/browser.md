
## 输入URL到看到页面发生什么（DNS解析-TCP连接-http请求/响应-浏览器解析渲染-连接结束）
1. 浏览器根据请求的URL交给DNS域名解析，通过域名找到真实IP；
2. TCP连接三次握手
    - 客户端向服务器发送一个建立连接的请求 syn（您好，我是A）
    - 服务器接到请求后发送同意连接的信号 syn+ack（收到，我是B）；
    - 客户端接到同意连接的信号后，再次向服务器发送确认信号 ack（那我们建立连接了），客户端与服务器建立了连接。
3. 请求：浏览器设置请求报文（请求行、头、主体），发起HTTP请求。
4. 响应: 服务器处理完成后返回响应报文,（起始行（状态码），响应头、主体）浏览器接收文件（HTML、JS、CSS、图象等）；
5. 浏览器对加载到的资源（HTML、JS、CSS等）进行语法解析，建立相应的内部数据结构（如HTML的DOM）；
6. 载入解析好的资源文件，渲染UI页面，完成。

- 从总体看优化：
    - 优化目的是将信息**快速并友好**的展示给用户并能够与用户进行交互。
    - 缩短连接时间：DNS优化
    - 减少响应内容大小：进行压缩和懒加载
    - 解析过程：减少回流重绘

### 细节：DNS解析
- 解析过程：
    - 首先在本地域名服务器中查询IP地址，没有找到就去com顶级域名服务器请求查找，找到后把IP地址缓存在本地域名服务器便于下次使用。
        ```
         . -> .com -> google.com. -> www.google.com.
         // 根域名服务器->com顶级域名服务器->一直找到对应的完整域名
        ```
- 优化（减少耗时，一般20-120ms，控制200ms以内）
    - DNS的缓存
        - 多级缓存顺序：浏览器缓存，系统缓存，路由器缓存，IPS服务器缓存，根域名服务器缓存，顶级域名服务器缓存，主域名服务器缓存。
    - dns-prefetch预解析
        - 适用于：引用很多第三方域名的资源的提前解析域名，如taobao。如果资源都在本域名下， 那就作用不大。   
        - 当我们从该 URL 请求一个资源时，就不再需要等待 DNS 的解析过程。
            ```
            <link rel="dns-prefetch" href="//example.com">
            ```
        - 浏览器会对a标签的href自动启用DNS Prefetching，所以a标签里包含的域名不需要在head中手动设置link。
        - HTTPS下不起作用，需要meta来强制开启a标签域名预解析。
            ```
            <meta http-equiv="x-dns-prefetch-control" content="on">
            ```
        
    - DNS的负载均衡
        - 又叫DNS重定向，根据每台机器负载量和距离返回一个合适的IP给用户。(CDN也是利用重定向)


### TCP三次握手
- 保证client和server均让对方知道自己**的接收和发送能力**没问题而保证的最小次数
- 每次握手都会带一个标识 seq，后续的ACK都会**对seq+1**来进行确认。
- 三次握手的本质，中间的一次动作是（ACK和SYN）的合并。
- 过程：
    - 客户端向服务器发送一个建立连接的请求 SYN（您好，我是A），客户端为syn_sent状态（主动半打开）
    - 服务器接到请求后发送同意连接的信号 ACK + SYN （收到，我是B），服务器端为syn_rcvd状态（被动半打开）
    - 客户端接到同意连接的信号后，客户端变成Estalished状态，再次向服务器发送确认信号 ACK（那我们建立连接了），服务器变成Estalished状态，客户端与服务器建立了连接。
![三次握手](./img/HTTP-three.gif)

### TCP数据传输
- 过程：一方发送data，另一方发送ack确认。
- 重传：客户端发送data，服务端没ack，需要TCP重传。
- 去重：服务端收到两次重复data，需要进行去重。
- 双工：双方都可以主动发起数据传输。

### TCP四次挥手
- 客户端 -- **FIN --> 服务端**， 客户端变成FIN—WAIT-1状态
- 服务端 -- **ACK --> 客户端**，  服务端变成CLOSE-WAIT状态，客户端变成FIN—WAIT-2状态（先回应ACK，等服务端还未发送完的所有报文发送完毕，才能发送FIN，不然还没发完就关闭了）
- 服务端 -- **FIN --> 客户端**， 服务端变成LAST-ACK状态，客户端变成TIME—WAIT状态
- 客户端 -- **ACK --> 服务端**，服务端收到ACK后变成CLOSED状态，**等待2MSL后**（2个报文最大生存时间，每个MSL是2min，共4min），客户端变成CLOSED状态
- 2个MSL: 一个保证最后的ACK能够到对面，一个保证重传的报文能到达。
![四次挥手](./img/HTTP-four.gif)

#### 缩写
- SYN：Synchronize 同步
- ACK: 应答，确认
- SYN-SENT：在发送连接请求后等待匹配的连接请求
- SYN-RECEIVED：在收到和发送一个连接请求后等待对连接请求的确认
- FIN：Finally 最终
- Estalished：建立

### TCP/IP 四(五)层协议
- 应用层(HTTP) -> 传输层(TCP/UDP) -> 网络层(IP和MAC) -> 链路层(驱动)

- 应用层：HTTP
    - TCP/IP 分层中，会话层，表示层，应用层集中在一起
    - 网络管理通过 SNMP 协议
- 传输层：通用的 TCP 和 UDP 协议
    - TCP 协议面向有连接，能正确处理丢包，传输顺序错乱的问题，但是为了建立与断开连接，需要至少7次的发包收包，资源浪费
    - UDP 面向无连接，不管对方有没有收到，如果要得到通知，需要通过应用层
- 网络层：IP和MAC地址
    - 使用 IP 协议，IP 协议基于 IP 转发分包数据
    - IP 协议是个不可靠协议，不会重发
    - IP 协议发送失败会使用ICMP 协议通知失败
    - ARP 解析 IP 中的 MAC 地址，MAC 地址由网卡出厂提供
    - IP 还隐含链路层的功能，不管双方底层的链路层是啥，都能通信
- 链路层：代表驱动
- 物理层：将二进制的0和1和电压高低，光的闪灭和电波的强弱信号进行转换

### HTTP传输流
- 发送端在层与层间传输数据时，每经过一层都会被加上首部信息，接收端每经过一层都会删除一条首部。
![HTTP传输流](./img/HTTP-flow.jpg)

### TCP和HTTP关系
- TCP协议对应于传输层，而HTTP协议对应于应用层，Http是基于Tcp协议的。
- HTTP会通过TCP建立起一个到服务器的连接通道，当本次请求需要的数据完毕后，HTTP会立即将TCP连接断开，这个过程是很短的。所以HTTP连接是一种短连接，是一种无状态的连接。


### HTTP请求
- 步骤：
    - 构建HTTP请求报文
    - 通过TCP协议发送到服务器指定端口(HTTP协议80/8080, HTTPS协议443)。
- 请求报文：
    - 请求行
    - 请求报头
    - 请求体(正文)
    
    ```
    // 请求行
    POST /query HTTP/1.1
    // 请求头
    Accept: */*
    Origin: https://juejin.im
    Accept-Encoding: gzip, deflate, br
    Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
    Content-Type: application/json;
    Cookie：Cookie: ab={}; _ga=GA1.2.1711725290.1560907409;
    
    // 如json请求体
    {"operationName":"","query":"","variables":{"type":"ALL","query":"url到页面","after":"","period":"ALL","first":20},"extensions":{"query":{"id":"a53db5867466eddc50d16a38cfeb0890"}}}
    ```
### HTTP响应
- 步骤：
    - 从端口接收到TCP报文，对请求进行解析
    - 请求处理完后，通过构建响应报文发送会客户端。
- 响应报文：
    - 状态行
    - 响应报头
    - 响应体(正文)

### HTTP报文结构
组成部分：起始行 + 头部(header) + 空行 + 实体(body)
    - 请求报文的起始行：方法 + 路径 + http版本 
        ```
        GET /home HTTP/1.1
        ```
    - 响应报文的起始行(状态行)：http版本 + 状态码 + 原因
        ```
        HTTP/1.1 200 OK
        ```
    - 空行：用来分开头部和实体 

### HTTP报头
- Origin：源
- Referer：来源
- Connection: keep-alive 长连接
- Content-Length: 825 内容长度
- Cookie：凭证
- Accept系列字段：
    - 数据格式：Content-Type
        ```
        // 发送端
        Content-Type: ...
        // 接收端
        Accept: ...
        
        可取值范围：
        text： text/html, text/plain, text/css 等
        image: image/gif, image/jpeg, image/png 等
        audio/video: audio/mpeg, video/mp4 等
        application: application/json, application/javascript, application/pdf, application/octet-stream 等
        ```
    - 压缩方式：Content-Encoding
        ```
        // 发送端
        Content-Encoding: gzip
        // 接收端
        Accept-Encoding: gzip
        ```
    - 支持语言：Content-Language
        ```
        // 发送端
        Content-Language: zh-CN, zh, en
        // 接收端
        Accept-Language: zh-CN, zh, en
        ```
    - 字符集：放在Content-Type中
        ```
        // 发送端
        Content-Type: text/html; charset=utf-8
        // 接收端
        Accept-Charset: charset=utf-8
        ```

- 响应的强缓存和协商缓存头如：Expires和Cache-Control、 ETag和Last-Modified    
- 其他自定义头如：token

### 细节：HTML建立dom树-词法解析和语法解析
- 词法解析：
    - 生成Tokens: 二进制转为字符串后，浏览器会将HTML字符串解析成Tokens
- 语法解析：
    - 构建Nodes: 开始结束标签配对、添加属性、父子兄弟关系连接，构成DOM Tree

### 细节：CSS规则树如何与dom结合成render树
- 实现：对dom树进行遍历，将css附着对应的元素上
- 顺序：浏览器选择器解析顺序（右->左），性能较好
- 原理：先找最右节点,再向上找对应的类或者标签，一开始就筛除大量不符合条件的节点。
### 细节：渲染UI页面的过程
1. 解析HTML生成DOM树。
2. 解析CSS生成CSS规则树。
3. 将DOM树与CSS规则树合并在一起生成渲染树Render Tree。
4. 遍历渲染树开始布局（Layout），计算每个节点的大小和坐标。
5. 调用GPU进行绘制（Paint）,遍历渲染树每个节点，绘制到屏幕显示。

### 重排（回流）和重绘
- 重排（回流）：节点尺寸需要重新计算，重新排列元素
- 重绘：样式发生变化，更新外观内容
- 重绘不一定出现重排
- 重排一定会出现重绘

### 如何触发
- display: none隐藏一个DOM节点 -> 回流和重绘
- visibility: hidden隐藏一个DOM节点 -> 重绘
- 增加、删除、更新dom
- 移动dom或者动画
- 调整窗口大小

### 如何优化
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
    
### 阻塞问题
- 资源文件异步不阻塞：浏览器在解析过程中，如果遇到请求外部资源时，如图像,iconfont,JS等。请求过程是异步的，并不会影响HTML文档进行加载。
- JS阻塞后续资源下载：当文档加载过程中遇到JS文件，HTML文档会挂起渲染过程，等到文档中JS文件加载完毕+解析+执行完毕，才会继续HTML的渲染过程。因为JS可能会修改DOM结构。
- CSS不影响JS加载，但影响JS的执行。

## HTTP/HTTPS/HTTP2 协议
![HTTP/HTTPS/HTTP2的flow](./img/HTTP-HTTPS-HTTP2-flow.jpg)
- HTTP1.0
    - 定义了三种请求方法： GET, POST 和 HEAD方法
    - 无法复用链接：完成即断开，重新慢启动和 TCP 3次握手,需要手动添加keep-alive
    - 线头阻塞：导致请求之间互相影响，等待前面请求响应后才能发请求，后续响应较快的请求被阻塞
- HTTP1.1
    - 新增了五种请求方法：OPTIONS, PUT, DELETE, TRACE 和 CONNECT
    - 默认长连接(Connection: keep-alive):返回本次请求结果后保持连接
        - 降低阻塞（TCP连接减少了），
        - 减少延迟，无须再握手
        - 较少的CPU和内存的使用
    - 新增功能:
        - 断点续传：RANGE:bytes=XXXX 从XX字节开始传送
        - 新增状态响应码
        - cache缓存增强（ETag，If-None-Match）
- HTTP/1.x的问题
    - HTTP/1.x中的头阻塞问题会造成连接总是处于等待响应的状态，而未充分利用带宽；
    - HTTP/1.x大量、重复的请求头在网络上传输，使网络负载了很大一部分本需要传输的数据量。
    - HTTP 1.x 中，如果想并发多个请求，必须使用多个TCP链接，浏览器为了控制资源，单个域名有6-8个的TCP链接请求限制
- HTTP2相对于HTTP1.x的优势
    - 二进制分帧：二进制格式替换之前文本格式传输数据，解析更高效，请求响应消息由一个或多个帧组成，分割为更小的帧，可乱序发送，根据流标示重组。
    - 头部压缩：只发送有差异头部，减少冗余头部数据传输，“首部表”
    - 多路复用：同域名下所有通信都在单个TCP连接上，**可以有多条流，每个流都有自己的帧**，避免每次都要建立TCP连接，可以同时发送请求或回应，且不按照顺序，比如耗时较长的请求可以放后面。
    - 服务器推送：发送页面HTML时主动推送JS和CSS资源，不需要等解析到再请求
- HTTPS是安全版的HTTP，区别如下
    - HTTP协议的数据都是明文传输的，HTTPS的TLS/SSL 进行加密
    - HTTPS需要到CA机构申请证书(一般收费)
    - HTTP是80端口，HTTPS是443端口
- 加密方案
    - 对称密钥：加密和解密同一个密钥，但秘钥容易被截获
    - 非对称密钥：秘钥对= 公钥+私钥，使用公钥加密的只有对应的私钥能解开，私钥加密只有公钥能解开，先将公钥发给对方，对方用公钥加密并返回数据，再用私钥解开。不过RSA算法太慢,影响性能
    - 结合：使用非对称密钥的方法将对称密钥发送给对方，后续用对称密钥解密。
    - 第三方认证CA(数字证书):保证首次将公钥发过去不被中间人篡改
        - 用经过hash的信息生成摘要（包括公钥 + 企业、网站信息），再用私钥加密，成为数字签名。
        - 公钥/信息+签名组合成数字证书
        - 获取数字证书，将原始信息同样hash生成摘要
        - 使用CA公钥解密签名生成的摘要，对比原始信息的摘要是否一致
- HTTPS总流程：
    - 服务器将公钥放在CA用私钥加密的数字证书中
    - 客户端收到数字证书，使用CA的公钥解密证书获取公钥并验证
    - 通过获得的公钥加密客户端生成的对称密钥，发给服务器，服务器用自己的私钥解密获得对称密钥
    - 此后加密连接就使用这个对称密钥进行加密通信。
- 中间人攻击（http中明文数据被窃听、篡改、冒充）

    > 攻击者与通讯的两端分别创建独立的联系, 并交换其所收到的数据, 使通讯的两端认为他们正在通过一个私密的连接与对方直接对话, 但事实上整个会话都被攻击者完全控制. 

    - 客户端发送请求到服务端，请求被中间人截获
    - 服务器向客户端发送公钥
    - 中间人截获公钥，保留在自己手上。然后自己生成一个【伪造的】公钥，发给客户端
    - 客户端收到伪造的公钥后，进行加密对称密钥发给服务器
    - 中间人用自己的私钥解密获得对称秘钥,同时生成假的对称密钥，发给服务器
    - 服务器用私钥解密获得假密钥,然后用假密钥加密数据传输给客户端
## 一个 tcp 连接能发几个 http 请求？
- HTTP 1.0：一个 TCP 发送一个 HTTP 请求，默认不支持长连接，请求发送完毕，tcp连接断开
- HTTP 1.1：默认支持长连接Connection: Keep-Alive，只要不断开就可以一直发送http请求，无上限。
- HTTP 2.0 ：支持多路复用，一个 TCP 连接可以并发多个 HTTP 请求，且支持长连接，无上限。
## 状态码
- 进行一个http请求的时候，我们看到的只是最后服务器返回来的状态码
- 1XX  信息 (服务器收到请求，需要继续处理)
- 2XX 成功
    - 200 OK，表示从客户端发来的请求在服务器端被正确处理 ✨
    - 204 No content，表示请求成功，但没有返回任何内容。
    - 206 Partial Content，客户端通过发送范围请求头Range抓取到资源的部分数据，断点下载/上传
- 3XX 重定向
    - 301 moved permanently，永久性重定向，表示资源已被分配了新的 URL
    - 302 found，临时性重定向，表示资源临时被分配了新的 URL ✨，请求还是原url
    - 304 not modified，未修改，可使用缓存✨（强缓存/协商缓存）
    - 307 temporary redirect，临时重定向，和302含义相同
    - 308 Permanent Redirect 类似301，但不允许浏览器将原本为 POST 的请求重定向到 GET 请求上。
    - 重定向307，308，303，302的区别？
        - 302是http1.0的协议状态码，在http1.1版本的时候为了细化302状态码又出来了两个303和307
        - 303明确表示客户端应当采用get方法获取资源，他会把POST请求变为GET请求进行重定向。
        - 307会遵照浏览器标准，不会从post变为get。
        - 308类似301，不会从post变为get。
- 4XX 客户端错误
    - 400 (错误请求)bad request，请求存在语法错误 ✨
    - 401 (未授权)unauthorized，请求要求身份验证。 ✨
    - 403 (禁止)forbidden，服务器拒绝请求 ✨
    - 404 (未找到)not found，请求的资源不存在 ✨
    - 405 (方法禁用)， 禁用请求中指定的方法。
    - 409 (冲突)Conflict，请求的资源可能引起
    - 415 (支持的媒体类型)请求的格式不受请求页面的支持，如json传成formdata。
- 5XX 服务器错误
    - 500 (服务器内部错误)internal sever error，表示服务器端内部错误 ✨
    - 501 (尚未执行)Not Implemented， 不支持请求的功能（无法完成请求方法）
    - 502 (错误网关) 服务器作为网关或代理，从上游服务器收到无效响应。
    - 503 (服务不可用) service unavailable，服务器暂时处于超负载或正在停机维护(暂时状态)
    - 504 (网关超时) Gateway Time-out， 服务器作为网关或代理，但是没有及时从远端服务器收到请求。
    - 505 (HTTP 版本不受支持)， 服务器不支持请求中所用的 HTTP 协议版本。

## Content-Type
> 取决后端需要什么格式的数据，但是文件必须使用multipart/form-data

- JSON
    - application/json
        - 格式为json字符串
            ```
            {"id":"123","name":"joe"}
            ```
- 两种表单数据提交方式
    - application/x-www-form-urlencoded
        - 键值对格式：key=value&key=value
        - get方式放在url后面，用?分割；post放在http body中。
        - 会进行url编码（键值对的参数用&连接；空格转为+加号；字符"a"-"z"，"A"-"Z"，"0"-"9"，"."，"-"，"*"，和"_"都不会被编码；其他符号(&@#)转为 【% + ASCII十六进制值】如%xy;）
            ```
            First name:Joe&Joan
            Last name:
            如：FirstName=Joe%26Joan&LastName=6+6+6
            ```
    - multipart/form-data(可用于文件上传，如有type=file)
        - 每个表单控件元素变为独立资源
        - 每部分会有http头描述如Content-Type(默认为text/plain)、Content-Disposition(form-data或者file)、name(控件name)、boundary值表示分割符：最后以加上--结尾。
            ```
            // headers
            Content-Type: multipart/form-data; boundary=----WebKitFormBoundary1XNKw5IGSxIzisBM
            
            // Form Data
            ------WebKitFormBoundary1XNKw5IGSxIzisBM
            Content-Disposition: form-data; name="deviceTypeIconFile"; filename="产品图.png"
            Content-Type: image/png
        
            
            ------WebKitFormBoundary1XNKw5IGSxIzisBM
            Content-Disposition: form-data; name="deviceTypeCode"
            
            0x1C
            ------WebKitFormBoundary1XNKw5IGSxIzisBM
            Content-Disposition: form-data; name="deviceType"
            
            空调
            ------WebKitFormBoundary1XNKw5IGSxIzisBM--
            ```
## AJAX
- 概念：异步JS和XML缩写，现在一般用JSON代替XML。
- 用处：在不刷新页面的情况下，向浏览器发起请求和接受响应，最后局部更新页面。
- 实现：基于XMLHttpRequest对象，可发起HTTP请求，监听readystate的变化获得响应，然后执行刷新。
- 使用：
    ```js
    var xhr = new XMLHttpRequest(); // 声明一个请求对象
    xhr.open('GET', 'url/xxxx',true);(默认为true，异步请求)
    // 如何设置请求头? xhr.setRequestHeader(header, value);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(); // get方法 send null(亦或者不传) ,post 的 send 则是传递值("fname=Henry&lname=Ford")
    
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {     // readyState 4 代表已向服务器发送请求
            if(xhr.status === 200) {   // status 200 代表服务器返回成功
               var json = JSON.parse(xhr.responseText);;  // 这是返回的文本
            } else {
                console.log("Error: "+ xhr.status); // 连接失败的时候抛出错误
            }
        }
    }
    ```
- 优点：无刷新请求数据
- 缺点：浏览器限制不能跨域，跨域看下面的方案。

## 跨域
- 同源：“协议+域名+端口”三者相同
- 浏览器这些标签不受同源策略
    ```html
    <img src=XXX>
    <link href=XXX>
    <script src=XXX>
    ```
- 注意：跨域请求能发出去，服务端能收到请求并正常返回结果，只是响应结果被浏览器拦截了
- jsonp
    - 本质：利用`<script>`标签不受同源策略限制的特性进行跨域操作
    - 核心实现：创建script标签发起get请求，前端定义函数，在后端把数据放入回调，然后返回前端执行。
    - 优点：简单就可实现跨域、兼容好
    - 缺点：只支持get请求，`<script>`标签只能get，且容易受xss攻击
    - 具体：创建一个`<script>`标签，src为跨域的API数据接口,声明一个回调函数，window[show]=function(){ resolve(data)}参数值为函数名(如show)在地址中向服务器传递该函数名（可以通过问号传参:?callback=show），服务器特殊处理show(data)返回给客户端，客户端再调用执行回调函数（show），对返回的数据进行操作。
- cors跨域资源共享
    - 主流跨域方案:http头告诉浏览器允许访问不同源服务器上的资源
    - 优点：简单配置即可跨域，支持所有类型的HTTP请求
    - 缺点：某些老旧浏览器不支持CORS
    - 允许该Origin请求，则响应里加入下面的头信息
    - Access-Control-Allow-Origin(简单请求+预检都会返回)：目标源
    - Access-Control-Allow-Methods(预检返回)： 允许的方法
    - Access-Control-Allow-Headers(预检返回)：允许的请求头
    - Access-Control-Max-Age(预检返回)：预检请求的有效期(有效期内不需要再发Option请求,浏览器有自己的最长时间限制，如600s)
- Nginx反向代理
    - 本质：利用服务器之间通信不受同源策略影响
    - 优点：最方便，支持所有浏览器，不需要改代码。
    - 实现：客户端所有请求经过nginx处理，nginx作为代理转发请求给服务器，服务器拿到响应，nginx返回给客户端。
    - 配置nginx.conf
    - add_header Access-Control-Allow-Origin *; 设置nginx允许跨域请求
    - location /api {... proxy_pass http://192.168.0.103:8080; } 转发地址
- vue开发环境的proxy
    - vue-cli3的vue.config.js的devServer的proxy
    - target、changeOrigin、pathRewrite
    - 底层使用了http-proxy-middleware（中间件代理）
        ```js
        module.exports = {
          devServer: {
            proxy: {
              '/api': {
                target: '<url>',
                ws: true,
                changeOrigin: true
              },
              '/foo': {
                target: '<other_url>'
              }
            }
          }
        }
        ```
- postMessage/onmessage
    - 允许来自不同源的脚本采用异步方式进行通信，可以实现跨文本档、多窗口、跨域消息传递。

## CORS
- 简单请求： GET、POST、HEAD 
- 非简单请求：请求方法 PUT和DELETE，或者Content-Type为application/json（POST时常用），或特殊请求头如Token
- 非简单请求（两步走）：浏览器检测到非简单请求，先进行一次预检(OPTIONS)请求，第二步才是真实请求。
    - 请求头包括源 + HTTP方法 + 额外头信息
    - 预检完返回CORS允许请求的头和方法（一般返回所有方法）和源，如果通过则发起请求
    - 预检失败，返回时不包括CORS头信息，浏览器认定失败。
    ```
    // 预检头信息
    Origin: http://api.bob.com
    Access-Control-Request-Method: PUT
    Access-Control-Request-Headers: X-Custom-Header
    // 预检响应
    Access-Control-Allow-Origin: http://api.bob.com
    Access-Control-Allow-Methods: GET, POST, PUT
    Access-Control-Allow-Headers: X-Custom-Header
    
    // 预检通过的再次请求
    Origin: http://api.bob.com
    X-Custom-Header: value
    // 正常响应
    Access-Control-Allow-Origin: http://api.bob.com
    ```
- 如何支持发送cookie（a.com请求 -> b.com的接口）
    - 默认情况下，跨域不携带cookie，所以要进行设置
    - 前端：
        - AJAX请求中打开xhr.withCredentials= true;属性允许发送cookie和接收服务器set-cookie。
    - 服务器：
        - Access-Control-Allow-Credentials：true(服务器同意发送cookie)
        - Access-Control-Allow-Origin就不能设为星号（*），必须指定明确的、与发起跨域请求网页一致的的域名(a.com)。
    - 遵循同源政策：服务器(b.com)设置cookie的才会上传，其他域的cookie不会上传，跨域原网页代码也获取不到服务器设置的cookie

## 正向代理和反向代理
- [解释和优缺点](https://juejin.im/post/5cc26dfef265da037b611738#heading-18)
- 正向代理
    - 代理的对象是客户端、隐藏真实客户端
    - 应用：国外搭建一个代理服务器，代理请求google
- 反向代理(通过负载均衡设备实现)
    - 代理的对象是服务端、隐藏真实服务端
    - 应用：www.baidu.com就是我们的反向代理服务器。Nginx就是性能非常好的反向代理服务器，用来做负载均衡，将过多请求分布给多个真实的服务器。隐藏IP端口号，更安全。

## get和post
- 参数
    - get通过url传输，post通过请求体传输
- 类型
    - get只允许ASCII字符，post无限制
- 限制
    - get有长度限制(浏览器限制)，post无限制，
- 安全
    - get不安全，通过历史记录可查，post安全，数据在请求体里
- 有害
    - get无害，刷新后退不会引起重复提交。
- 幂等性
    - get幂等，post非幂等(幂等表示执行相同的操作，效果一样)
- TCP数据包
    - get一个，post两个(先发header，返回100再发body的数据)
- 场景
    - get一般用于获取资源，post一般用来创建资源。
    - axios的get方法不支持在body传参，只支持params，如果要传递，需要使用post。或者自己xhr封装实现，理论上是可以在body里传，但一般不这么做。

## cookie和session区别
- 安全性： Session 比 Cookie 安全，Session 是存储在服务器端的，Cookie 是存储在客户端的。
- 存取值的类型不同：Cookie 只支持存字符串数据，想要设置其他类型的数据，需要将其转换成字符串，Session 可以存任意数据类型。
- 有效期不同： Cookie 可设置为长时间保持，比如我们经常使用的默认登录功能，Session 一般失效时间较短，客户端关闭（默认情况下，sessionId被删导致失效的）或者 Session 超时都会失效。
- 存储大小不同： 单个 Cookie 保存的数据不能超过 4K，Session 可存储数据远高于 Cookie，但是当访问量过多，会占用过多的服务器资源。

- cookie注意
    - 无法跨域
    - 使用 httpOnly禁止js通过 document.cookie 读取cookie（提高安全性，防范xss）
    - maxAge表示失效时间（秒），负数表示临时 cookie，关闭浏览器就删除。默认-1，为0表示删除，。
    - expires 设置过期时间，不设置，为Session，保存在客户端内存，关闭浏览器失效。
    - domain 指定cookie所属域名， .taobao.com表示a.taobao.com 还是 b .taobao.com 都可以使用 Cookie。
    - secure 设为true，在HTTPS才有效
    - Path 指定了一个 URL 路径，该路径下的可以发送cookie
    - **SameSite： Chrome80 版本中默认屏蔽了第三方的 Cookie（Lax）**
        - 让 Cookie 在跨站请求时不会被发送
        - Strict 这个 Cookie 在任何情况下都不可能作为第三方 Cookie，跨站请求不能携带
        - Lax 允许部分第三方请求携带 Cookie（比如get）
        - None 无论是否跨站都会发送 Cookie  
        - 影响：Post 表单，iframe（广告），AJAX，Image（埋点），`<script>`（jsonp）不发送三方 Cookie
        - 改造：SameSite=none，允许同站、跨站请求携带该cookie
    -  三方cookie
        - 用途：前端日志打点监控、行为分析、广告推荐 
        - 实现：a站写入第三方cookie，页面操作过程，将携带第三方cookie向第三方域发起请求，第三方域获取到数据。
        - 现状：Firefox、Safari 默认禁止、Chrome —— SameSite Cookie、2022将全面禁止
        - 解决：转成一方cookie（js操作document.cookie设置第三方cookie，而不是set-cookie，请求将cookie放在请求参数中，而不是放在cookie中，模拟三方cookie的标识用户的过程），不过第三方sdk能获取信息就更多，风险大。
    - 通过JS创建cookie
        - 可添加过期日期expires、可添加path设置路径（默认属于当前页）
            ```js
            document.cookie = "username=Joe; expires=Sun, 31 Dec 2017 12:00:00 UTC; path=/";
            ```    
- session注意
    - session 是基于 cookie 实现的，session 存储在服务器端，sessionId 会被存储到客户端的cookie 中
    - session失效两种情况
        - 一是cookie是会话有效，关闭浏览器，sessionid被清理。
        - 二是服务器设置session失效时间，到期就清理掉该session
    - 用户比较多时，数据大占内存，**给session设置失效时间**，定期清理过期的session
    - 集群部署，多台服务器要做session共享
        - 可通过复制，广播给其他节点来同步session
            - 网络负荷压力大
        - 或者更优的分布式缓存方案Redis（集群） 来缓存 session
            - 方便扩展、跨平台
        - session 持久化
            - 数据库压力大
    - 如果cookie被禁止，sessionId可在url参数后传递。
- Access Token注意（令牌）
    - uid+time+sign（用户标识+时间戳+哈希签名）
    - 服务器签发token，客户端保存localStorage或者cookie ，每次请求放在header上，服务器接收验证。
    - 可避免CSRF攻击
    - 移动端常用，一般Access Token设置一周，Refresh Token一个月
    - Refresh Token 设置更长有效期，当Access Token过期，可通过携带Refresh Token去请求新的Acesss Token。当Refresh Token过期只能重新登录 了 
- JWT注意（JSON Web Token）
    - Header（头部）+Payload（负载）+Signature（签名）：字符串：Header.Payload.Signature
      ```
        // Header
        {
          "alg": "HS256",
          "typ": "JWT"
        }
        // Payload
        {
          "sub": "1234567890",
          "name": "John Doe",
          "admin": true
        }
        // Signature
          HMACSHA256(
              base64UrlEncode(header) + "." +
              base64UrlEncode(payload),
              secret)
      ```
    - 服务器签发token，客户端保存localStorage或者cookie ，每次请求放在header上的Authorization ，服务器接收解密验证。
    - 优点：无状态认证，不保存session数据，降低查询数据库次数，服务器认方便扩展
    - 缺点：服务器不保存session，无法废弃某个token，一旦 JWT 签发了，到期之前就会始终有效
    - 减少盗用：HTTPS、和有效期设置短
- JWT和token的区别
    - token验证发过来的token后，还要查数据库获取用户信息，验证是否有效。
    - JWT包含用户信息和加密数据，服务端只需要使用密钥解密进行校验，不需要查数据库或者少查。