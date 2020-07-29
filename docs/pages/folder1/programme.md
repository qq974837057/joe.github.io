
## 原型链相关
有个构造函数class A {}，new A()生成实例a。
- `a.__proto__`和`A.prototype` 关系 ?
- `a.__proto__.__proto__`是什么?
- `a.__proto__.__proto__.__proto__`是什么?
- `Function(构造函数).__proto__` 是什么?
- `Function(构造函数).__proto__.__proto__` 是什么?

```js
a.__proto__ === A.prototype  // 构造函数的prototype
a.__proto__.__proto__ === Object.prototype // Object.prototype
a.__proto__.__proto__.__proto__ === null   // 原型链终点

Function.__proto__ === Function.prototype
Function.__proto__.__proto__ === Object.prototype
```


## Object和Function的instancof关系
- 结果均为true，此处Object和Function都是构造函数。
    - 构造函数的__proto__都是Function.prototype，所以instanceof Function
    - 构造函数的__proto__.__proto__都是Object.prototype，所以instanceof Object

```js
Object instanceof Function
// 等价于 Object.__proto__ === Function.prototype //true

Function instanceof Function
// 等价于 Function.__proto__ === Function.prototype //true


Function instanceof Object
// 等价于 Function.__proto__.__proto__ === Object.prototype //true

Object instanceof Object
// 等价于 Object.__proto__.__proto__ === Object.prototype //true

```

## 反转字符串
```js
let newStr = str.split('').reverse().join('');
```

## 实现一个sleep函数

```js
function sleep(wait) {
    return new Promise((resolve) => setTimeout(resolve, wait));
}
async function test() {
    await sleep(1000);
    console.log('等待结束');
}
test();
```


## 实现一个批量请求函数 multiRequest(urls, maxNum)
- 要求最大并发数 maxNum
- 每当有一个请求返回，就留下一个空位，可以增加新的请求
- 所有请求完成后，结果按照 urls 里面的顺序依次打出

- 思路：
    - 类似实现并发限制的promise.all
- 步骤：
    - 首先确定函数的参数，urls数组和maxNum并发限制数
    - 设置result，填满标志位为false，方便有结果后将标志位替换为对应的res
    - 设置count表示开始请求的个数，设置sum表示urls总数
    - 返回一个promise
        - promise里先while循环执行next()执行一轮最大限制的并发请求
        - 定义一个next方法
            - 先执行`current = count++`
            - 判断current 比 总数sum大，则判断是否标志位都不为false，是则执行`reslove(result)`，不是就`return`
            - 判断current 比 总数sum小，取出在current位置的url -> `urls[current]`。然后执行`fetch(url).then(res => res保存在result[current]中 + current仍小于sum继续递归next()).catch(err => err保存在result[current]中 + current仍小于sum继续递归next())`
```js
// 如果maxNum不限的话，实际就是promise.all
function multiRequest(urls = [], maxNum) {
    let result = new Array(urls.length).fill(false);
    let sum = urls.length; // url总数
    let count = 0; // 已经开始请求的个数
    return new Promise((resolve, reject) => {
        // 先开始一波最大限制的并发请求
        while(count < maxNum) {
            next();
        }
        function next() {
            let current = count++;
            if(current >= sum) {
                // 请求发出还未响应完成，就等待result标志位都不为false，代表全部完成。
                !result.includes(false) && resolve(result);
                return
            }
            let url = urls[current];
            console.log('开始' + current, new Date().toLocaleString());
            fetch(url).then(res => {
                console.log('结束' + current, new Date().toLocaleString());
                result[current] = res;
                // 还有未完成的url，进行递归。
                if(current < sum) {
                    next();
                }
            }).catch(err => {
                console.log('结束' + current, new Date().toLocaleString());
                result[current] = err;
                if(current < sum) {
                    next();
                }
            })
        }
    })
}

let url2 = `https://api.github.com/search/users?q=d`;
let arr = new Array(20).fill(url2);
multiRequest(arr, 10).then((res) => {
    console.log(res);
})
```

## 解析URL参数
- 解析一个URL，将query参数提取出来转为obj对象格式。
  - Tips：中文要使用decodeURIComponent(val)进行解码
  - 如：{ a: '1', b: '2', c: 'xx', d: '北京' }

```js
const url = 'http://sample.com/?a=1&b=2&c=xx&d=%E5%8C%97%E4%BA%AC#hash';
```


- 方法一：URLSearchParams对象
  - URLSearchParams 的对象可以直接用在 for...of 结构中
  - 新建URL后的searchParams属性:是URLSearchParams对象，访问search中找到的各个查询参数。
  - for (const [key, value] of mySearchParams) {}
  - for (const [key, value] of mySearchParams.entries()) {}

```js
const parse = (url) => {
  const s = new URL(url).searchParams;
  const result = {};
  for(const [key, value] of s) { 
    result[key] = value; 
  }
  return result;
} 
console.log(parse(url));
```

- 方法二：字符串切割

> encodeURI()和encodeURIComponent()它们的主要区别在于，encodeURI()不会对本身属于URI的特殊字符进行编码，例如冒号:、正斜杠/、问号?和井号#；而encodeURIComponent()则会对它发现的任何非标准字符进行编码。不转义的字符：`A-Z a-z 0-9 - _ . ! ~ * ' ( )`

> 为了避免服务器收到不可预知的请求，对任何用户输入的作为URI部分的内容你都需要用encodeURIComponent进行转义。比如，一个用户可能会输入"Thyme &time=again"作为comment变量的一部分。如果不使用encodeURIComponent对此内容进行转义，服务器得到的将是comment=Thyme%20&time=again。请注意，"&"符号和"="符号产生了一个新的键值对，所以服务器得到两个键值对（一个键值对是comment=Thyme，另一个则是time=again），而不是一个键值对。

```js
const parse2 = (url) => {
  const queryArr = url.split('?').pop().split('#').shift().split('&');
  const result = {};
  queryArr.forEach( item => {
    const [key, val] = item.split('=');
    result[key] = decodeURIComponent(val); // 中文要解码
  });
  return result;
}
console.log(parse2(url));
```

- 方法三：正则匹配
  - str.replace(regexp|substr, newSubStr|function)
  - replace(..., (match,p1,p2) => {}) 表示match匹配的子串,p1第一个括号,p2第二个括号

```js
const parse1 = (url) =>{
  const result = {};
  url.replace(/([^?&=]+)=([^&#]+)/g, (match, key, val) => (result[key] = decodeURIComponent(val)));
  return result;
}
console.log(parse1(url));
```



## 实现add函数-闭包
```js
const add = (function() {
    let count = 0;
    return function() {
        console.log(count++); // 使父级的count变量+1
    }
})();
// add保存的是返回的闭包函数，再执行一次该函数，完成自增。
add(); // 0
add(); // 1
add(); // 2
```

## 双飞翼布局
- 内容高度已知，三栏布局，左右栏300px，中间自适应。
- 五种方法:浮动，绝对定位，flex，表格，网格
  - float：左右两边width都300，左边左浮动，右边右浮动，中间div放最后。
  - absolute：左右两边width都300，左边距left为0，右边距right为0，中间距left&right都为300。
  - flex：父flex，左右两边width都300，中间放大比例为1。
  - table：父table，子table-cell，左右两边width都300，中间要放中间位置。
- 优缺点
  - 浮动：简洁高效，但需要注意中间一栏放在最后，且要避免clear:both
  - 绝对定位：容易理解，但中间一栏如果存在较大宽度元素，会超出中间层。
  - flex：兼容性好(不受内容高度影响)，但需要注意中间一栏放在中间，移动端普遍适用。
  - table：兼容性好(不受内容高度影响)，但需要注意中间一栏放在中间。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Layout</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
    
    </style>
</head>
<body>
  <section class="layout float">
        <style>
        html * {
            margin: 0;
            padding: 0;
        }
        .layout article{
            margin-top: 10px;
        }
        .layout article div{
            min-height: 100px;
        }
        .layout.float .left {
            width: 300px;
            float: left;
            background: rgb(63, 128, 44);
        }
        .layout.float .center {
            background: rgb(76, 108, 196);
        }
        .layout.float .right {
            width: 300px;
            float: right;
            background: rgb(161, 86, 86);
        }
        </style>
        <article class="left-center-right">
            <div class="left"></div>
            <div class="right"></div>
            <!-- center要放在最后一个 -->
            <div class="center">
                    <h1>这是浮动布局中间部分</h1>
                    <p>这是文字</p>
                    <p>这是文字</p>
                    <p>这是文字</p>
                    <p>这是文字</p>
                    <p>这是文字</p>
            </div>
        </article>
    </section>
    <section class="layout absolute">
            <style>
            .layout.absolute .left-center-right div{
                position: absolute;
            }
            .layout.absolute .left {
                left: 0;
                width: 300px;
                background: rgb(63, 128, 44);
            }
            .layout.absolute .center {
                left: 300px;
                right: 300px;
                background: rgb(76, 108, 196);
            }
            .layout.absolute .right {
                right: 0;
                width: 300px;
                background: rgb(161, 86, 86);
            }
            </style>
            <article class="left-center-right">
                <div class="left"></div>
                <div class="right"></div>
                <div class="center">
                        <h1>这是绝对定位布局中间部分</h1>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                </div>
            </article>
    </section>
    <section class="layout flex">
                <style>
                .layout.flex article {
                    margin-top: 120px; 
                    display: flex;
                }
                .layout.flex .left {
                    width: 300px;
                    background: rgb(63, 128, 44);
                }
                .layout.flex .center {
                    flex: 1;
                    background: rgb(76, 108, 196);
                }
                .layout.flex .right {
                    width: 300px;
                    background: rgb(161, 86, 86);
                }
                </style>
                <article class="left-center-right">
                    <div class="left"></div>
                    
                    <div class="right"></div>
                    <div class="center">
                            <h1>这是flex布局中间部分</h1>
                            <p>这是文字</p>
                            <p>这是文字</p>
                            <p>这是文字</p>
                            <p>这是文字</p>
                            <p>这是文字</p>
                    </div>
                    
                </article>
    </section>
    <section class="layout table">
            <style>
            .layout.table .left-center-right {
                display: table;
                width: 100%;
            }
            .layout.table .left-center-right div{
                display: table-cell;
            }
            .layout.table .left {
                width: 300px;
                background: rgb(63, 128, 44);
            }
            .layout.table .center {
                background: rgb(76, 108, 196);
            }
            .layout.table .right {
                width: 300px;
                background: rgb(161, 86, 86);
            }
            </style>
            <article class="left-center-right">
                <div class="left"></div>
                <div class="center">
                        <h1>这是表格布局中间部分</h1>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                </div>
                <div class="right"></div>
                
            </article>
    </section>
    <section class="layout grid">
            <style>
            .layout.grid .left-center-right {
                display: grid;
                width: 100%;
                grid-template-rows: 100px;
                grid-template-columns: 300px auto 300px;
            }
            .layout.grid .left {
                background: rgb(63, 128, 44);
            }
            .layout.grid .center {
                background: rgb(76, 108, 196);
            }
            .layout.grid .right {
                background: rgb(161, 86, 86);
            }
            </style>
            <article class="left-center-right">
                <div class="left"></div>
                <div class="center">
                        <h1>这是grid布局中间部分</h1>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                        <p>这是文字</p>
                </div>
                <div class="right"></div>
                
            </article>
    </section>
</body>
</html>
```

## 代码题

### 异步
```js
setTimeout(() => {
    console.log('a')
}, 3000);

const now = Date.now();
while(Date.now() - now < 1500) {
    // do nothing
}

setTimeout(() => {
    console.log('b')
}, 1000);
```
- 临界值是2000ms
    - 同步代码执行时间超过2000ms，打印a、b
    - 同步代码执行时间小于2000ms，打印b、a

```js
for(var i =0; i< 5;i++){
    setTimeout(function(){
    console.log(new Date, i);
},1000);
}

console.log(new Date, i);

// Fri Jul 10 2020 17:26:01 GMT+0800 (中国标准时间) 5

// Fri Jul 10 2020 17:26:02 GMT+0800 (中国标准时间) 5
// Fri Jul 10 2020 17:26:02 GMT+0800 (中国标准时间) 5
// Fri Jul 10 2020 17:26:02 GMT+0800 (中国标准时间) 5
// Fri Jul 10 2020 17:26:02 GMT+0800 (中国标准时间) 5
// Fri Jul 10 2020 17:26:02 GMT+0800 (中国标准时间) 5
```
- i都是5、new Date表示打印时的时间，都是1秒后回调函数进入任务队列，所以都是2秒。