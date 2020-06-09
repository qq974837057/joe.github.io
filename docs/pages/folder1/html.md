
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

## SEO（搜索引擎优化）
- 利用搜索引擎的规则
- 提高网站在有关搜索内的自然排名

## <!DOCTYPE html>
- 声明文档类型和DTD规范的
- 作用：告知浏览器的解析器用什么文档标准解析这个文档。
- 必须声明在HTML文档的第一行。
