
## HTML 语义化
- 概念：正确的html标签做正确的事情，让页面具有良好结构和含义。
如：p代表段落，article代表正文，nav代表导航，section代表章节
- 好处：
    - 1、页面结构清晰，方便阅读维护，支持读屏软件。
    - 2、利于seo，爬虫更好获取信息，提升搜索量。
- 缺点：
冗余标签，导致嵌套过多。
- 使用原则：
    - 1、用对比不用好，不用比用错好。
    - 2、明确场景可使用语义化：
        - 页面整体结构（header、nav、aside、section、footer）
        - 自然语言的补充、比如重音（em）、注音（ruby）

    ```html
    // 语义化标签示例：
    <body>
        <header>
            <nav>
                ……
            </nav>
        </header>
        <aside>
            <nav>
                ……
            </nav>
        </aside>
        <section>……</section>
        <section>……</section>
        <section>……</section>
        <footer>
            <address>……</address>
        </footer>
    </body>
    ```


## SEO（搜索引擎优化）
- 利用搜索引擎的规则
- 提高网站在有关搜索内的自然排名


## DOCTYPE
- `<!DOCTYPE html>` 声明文档类型和引入DTD规范(H4.0.1才需要DTD)
- 作用：告知浏览器的解析器用什么文档标准解析这个文档。
- 必须声明在HTML文档的第一行。

## HTML 5 新标签
- `<header>`：定义了文档的头部区域
- `<footer>`：定义 section 或 document 的页脚。
- `<article>`：定义页面独立的内容区域
- `<aside>`：定义页面的侧边栏内容
- `<nav>`：定义导航链接的部分。
- `<video>`：定义视频（video 或者 movie）
- `<audio>`：定义音频内容
- `<canvas>`：标签定义图形
...

## 常用的meta标签
meta标签由name和content两个属性来定义，来描述一个HTML网页文档的元信息
- viewport —— 可以控制视口的大小和比例
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```
- keywords —— 关键词，用于搜索引擎
```html
<meta name="keywords" content="HTML, CSS, XML, XHTML, JavaScript">
```
- charset —— 描述HTML文档的编码形式（HTML5 中，有一个新的 charset 属性）
```html
<meta charset="UTF-8" >
```
- http-equiv —— 通过content属性设置http头部,可以设置http的缓存过期日期
```html
<meta http-equiv="expires" content="Wed, 20 Jun 2019 22:33:00 GMT">
```


## Label标签
- 将该标签显示的内容绑定对应的表单控件。
- 将`<label>` 标签的 for 属性和控件的id设置为相同即可。
- 多个控件(input)的name设为相同可限制单选一个，如sex性别，选男或女。

```html
<label for="name"> Name: </label>
<input type="text" id="name"/>

<form>
  <label for="male">Male</label>
  <input type="radio" name="sex" id="male" />
  <br />
  <label for="female">Female</label>
  <input type="radio" name="sex" id="female" />
</form>

```

## 易混淆的标签
- title 和 h1
    - `<title>` 单纯的标题，放在head中浏览器会特殊处理，放在标题栏上
    - `<h1>` 标题 + 层次明确，对页面信息的抓取有很大的影响
- b 和 strong
    - `<b>` 单纯的粗体
    - `<strong>` 粗体 + 语气更强的强调，使用阅读设备`<strong>`会重读
- i 和 em
    - `<i>` 单纯的斜体
    - `<em>` 斜体 + 强调


## 标准模式和兼容模式
- 标准模式：排版和js都以浏览器最高标准执行
- 兼容模式：以宽松的向后兼容方式显示，模拟老式浏览器的行为，以防无法正常工作。
- 比如：360浏览器里有着两个浏览器内核，一个是极速模式用的谷歌浏览器Chrome（Chrommium内核），另外一个是兼容模式用IE浏览器IE（Trident内核）

## 行内元素、块级元素、空元素
> CSS规范规定，每个元素都有display属性，确定该元素的类型，每个元素都有默认的display值。如div的display默认值为“block”，则为“块级”元素；span默认display属性值为“inline”，是“行内”元素。

默认情况下
- 行内元素不会以新行开始，块级元素会新起一行。
- 行内元素只能包含数据和其他行内元素，块级元素可以包含行内元素和其他块级元素。
- 块级元素只能出现在 `<body>` 元素内。

1. 行内元素有：a b span img input select button em strong ...（强调的语气）
2. 块级元素有：div ul ol li dl dd h1…h6 p table form ...
3. 常见的空元素：`<br>换行` `<hr>分割线` `<img>` `<input>` `<link>` `<meta>`... (在开始标签加斜杠表示闭合空元素，如`<br />`)


## src(引入文件)和href(链接跳转)的区别
- src表示来源地址，是**引入**。
    - 用于 img、script、iframe等
    - 解析到该元素，暂停其他资源下载和处理，直到加载执行完毕，js一般放底部。
- href表示超文本**引用**，指向需要连接的资源位置。
    - 用于link和a等
    - 并行下载，不会暂停当前处理。

## DOM事件模型

- DOM 0/2/3 级别
    ```js
    // DOM0
    element.onclick = function (event) {}
    // DOM2
    element.addEventListener('click', function(event){},false)
    // DOM3
    element.addEventListener('keyup', function(event){},false)

    //例子：
    var btn = document.getELementById('myBtn');
    btn.onclick = function() {
        alert('clicked')
    }
    btn.addEventListener('click', function() {
        alert('clicked');
    }, false)
    ```
    - 参数：
        - 事件名
        - 事件处理函数
        - 布尔值：true表示在捕获阶段调用处理函数，false表示在冒泡阶段调用处理函数。一般推荐放在冒泡阶段，兼容多个浏览器，不是特别需要在到达目标前截获就不放在捕获阶段。
    - DOM2/3可为同一元素添加多个事件处理程序，按照添加顺序依次触发。    
- DOM2事件模型
    - 三个阶段：第一阶段捕获，第二阶段目标阶段，第三阶段冒泡阶段
    - 捕获流程(从最外层一层层进入)：window -> document -> html -> body ->... -> 目标元素
    - 冒泡流程(从最里层一层层出去)：目标元素-> ... -> body-> html -> document -> window
    - 当addEventListener方法的**第三个参数为true时，表示只进行事件捕获，不执行事件冒泡**，在捕获的过程中，触发途径标签的对应事件函数。当第三个参数为false，表示执行事件冒泡的过程（默认情况）
- DOM3级事件在DOM2级事件的基础上添加了更多的事件类型,全部类型如下：
    - UI事件，当用户与页面上的元素交互时触发，如：load、scroll、resize
    - 焦点事件，当元素获得或失去焦点时触发，如：blur、focus
    - 鼠标事件，当用户通过鼠标在页面执行操作时触发如：click、dbclick、mouseup
    - 滚轮事件，当使用鼠标滚轮或类似设备时触发，如：mousewheel（已废弃，现为WheelEvent.deltaX横线滚动量）
    - 文本事件，当在文档中输入文本时触发，如：textInput
    - 键盘事件，当用户通过键盘在页面上执行操作时触发，如：keydown、keypress、keyup
    - 合成事件，当为IME（输入法编辑器）输入字符时触发，如：compositionstart

- event对象
    - event.preventDefault() 阻止默认事件（如a标签点击默认跳转）
    - event.stopPropagation() 阻止事件捕获或冒泡（父元素不响应）
    - event.stopImmediatePropagation() 阻止捕获或冒泡，且阻止其他事件执行。如同个按钮两个函数，可在a中阻止b。
    - event.currentTarget 正在处理事件的对象（挂载onclick的对象），总是等于事件处理函数内部this
    - event.target 父元素绑定事件监听子元素，表示被触发的那个子元素。
    - 当挂载监听事件和触发是同个dom，则target和currentTarget和this是同一个。

- 事件委托
    - 定义：利用事件冒泡，只指定一个事件处理程序，管理某一事件类型的所有事件，不必在每个元素上添加事件处理程序。
    - 实现：在DOM树更高的层次添加事件处理程序，如给父组件添加事件，通过事件冒泡，排查触发事件的子元素是否为指定元素，并进行对应的处理。
    - 优点：DOM引用减少，占用内存减少，提高性能。
    - 适合采用事件委托的：click、mousedown、mouseup、keydown、keyup和keypress。
    
- 移除事件监听
    - 为了避免DOM被移除或者页面卸载时候，事件处理程序的引用仍保存在内存中，无法回收。
    - 方法：
        - 1、DOM 0级： btn.onclick = null; DOM2/3级：btn.removeEventListener("click",handler,false); 
        - 2、在页面卸载时监听的onunload事件中，移除所有事件处理程序。
        
        > 注意removeEventListener("click",handler,false);和addEventListener("click",handler,false);是同一个处理函数。 









