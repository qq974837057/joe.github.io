

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
- 方法二：正则匹配
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

- 方法三：字符串切割

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