## 盒子模型
- 盒模型由content（内容）、padding（内边距）、border（边框）、margin（外边距）组成。
- 标准模型（w3c）
    - box-sizing：content-box
    - 默认值，width=content，border和padding不计算入width之内
- 怪异模型（IE）
    - box-sizing：border-box
    - width=content+border+padding（常用）
## 层叠上下文
- 层叠顺序：负z-index > block > float > inline/inline-block > z-index:auto/0 （新增不依赖z-index的层叠上下文）> 正z-index 
- 谁大谁上：当具有明显的层叠水平标示的时候，如识别的z-indx值，在同一个层叠上下文领域，层叠水平值大的那一个覆盖小的那一个。
- 后来居上：当元素的层叠水平一致、层叠顺序相同的时候，在DOM流中处于后面的元素会覆盖前面的元素。

## 居中
### 水平居中
- 行内元素
    - text-align: center
- 块级元素
    - flex：（父）flex + justify-content: center
    - margin：width：100px ; margin: 0 auto ;或者 子display:table;margin: 0 auto;
    - absolute+transform：absolute + transform（父relative+ 子absolute + left:50% + translateX（-50%））
### 垂直居中
- 单行内联：line-height: height
- 块级元素
    - flex：(父)flex + align-items:center (多个块并排)
    - absolute+负margin：(父relative+子absolute+top:50%+margin-top：-50px)
    - absolute+ transform：（父relative+子absolute+top:50%+translateY(-50%)）
### 水平垂直
- 父flex + justify-content : center+ align-items: center（父要设高度）
- 父flex/grid + 子margin auto（最简单）（父要设高度）
- 已知宽高：absolute+top50%+left50%+margin：-50px 0 0 -50px
- 未知宽高：absolute + transform（父relative+子absolute+top50%+left50%+translate（-50%，-50%））

## 使一个元素不可见的方式（常见3种+1种）
- display:none 文档流消失，不占空间、回流重绘、不可点击、不会继承
- visibility:hidden 隐藏元素，占空间、重绘、不可点击、可继承（子孙可设置取消隐藏）
- opacity:0 透明度为0，占空间、(提升为合成层不会重绘)、可点击、可继承（不能取消隐藏）
- z-index:-9999: 层级放最低，被覆盖

## 选择器有哪些
- id选择器#myid
- 类选择器.myclassname
- 伪类选择器a:hover,li:nth-child
- 标签选择器div、h1、p
- 相邻选择器h1+p（所有紧接在h1后面的第一个p元素）
- 子选择器ul>li（父元素为ul的所有li）
- 后代选择器li a（内部的所有a元素，不管嵌套多深）（h标签的后代使用其他h标签，失效）
- 通配符选择器*
- 属性选择器a[rel='external']


## 选择器优先级（权重）
- !important声明的样式优先级最高
- 优先级相同，最后出现的优先级高   
- 组合的如何计算
    - 内联样式(A) > ID选择器(B) > 类选择器/伪类(C) > 标签选择器/伪元素(D) 通配符 > 继承 > 浏览器默认属性
    - 从A到D，，出现次数就加1，分类计数。
    - 一一比较，直到比较出最大值，即可停止。
    ```css
    ul ol li .red {
        ...
    } //{0, 0, 1 ,3}
    #red {
    
    } //{0, 1, 0 ,0}
    ``` 
    
## 伪类和伪元素（本质：是否抽象创造了新元素）
- 伪元素：伪元素创立了一个DOM树外的元素
    - 两个冒号（::）CSS3要求
    - 用途：增加元素、画小图标、清除浮动（clear：both）
        ```
        // before/after伪元素通过content属性来添加内容。默认是行内元素
        ::before	// 选中的元素的第一个子元素。
        ::after	// 选中元素的最后一个子元素。
        ```
- 伪类：表示元素的一个状态
    - 一个冒号（:）
    - 用途：交互的样式、给某个位置的元素添加样式
        ```
        :active	匹配被用户激活的元素。即鼠标主键按下的元素或者tab键选中的元素
        :focus	表示获得焦点的元素
        :hover	滑过元素时，pc端指鼠标，移动端指触摸（通常会有bug）
        :link		所有尚未访问的链接。
        :visited	用户已访问过的链接
        :first-child	一组兄弟元素中的第一个元素
        :nth-child(n)	找到所有当前元素的兄弟元素中符合条件的元素，例如2n+1就是查找1，3，5，7等
        :last-of-type	一组兄弟元素中的具有相同元素类型的最后一个元素
        :nth-of-type(n)	查找符合条件的相同元素类型的兄弟元素
        ```
## BFC
- BFC全称是Block Formatting Context，即块格式化上下文。
- 特点：
    - BFC是个独立的容器，外面的元素和里面的元素互不干扰。内部会垂直方向一个个放置。
    - 在同个BFC中相邻的块级元素的垂直外边距会折叠(Mastering margin collapsing)。
    - 计算BFC高度，浮动元素参与计算
- 应用：
    - 解决边距重叠
    - 清除浮动（解决浮动元素的父元素高度塌陷）
    - 防止文字环绕
- 如何创建BFC
    - 0、根元素`<html>`
    - 1、浮动元素：float:不为none。
    - 2、绝对定位：position 为absolute或fixed 
    - 3、dispaly ：inline-box  table-cell  table flex grid。
    - 4、overflow不为visible: hidden、auto、scroll。


## 位置position属性介绍

- static，默认值。位置设置为static的元素，它始终会处于文档流给予的位置。
- inherit，规定应该从父元素继承 position 属性的值。但是任何的版本的 Internet Explorer （包括 IE8）都不支持属性值 “inherit”。
- fixed，生成绝对定位的元素。默认情况下，可定位于相对于浏览器窗口的指定坐标。元素的位置通过 “left”, “top”, “right” 以及 “bottom” 属性进行规定。不论窗口滚动与否，元素都会留在那个位置。但当祖先元素具有transform属性且不为none时，就会相对于祖先元素指定坐标，而不是浏览器窗口。
absolute，生成绝对定位的元素，相对于距该元素最近的已定位的祖先元素进行定位。此元素的位置可通过 “left”、”top”、”right” 以及 “bottom” 属性来规定。
- relative，生成相对定位的元素，相对于该元素在文档中的初始位置进行定位。通过 “left”、”top”、”right” 以及 “bottom” 属性来设置此元素相对于自身位置的偏移。

浮动、绝对定位和固定定位会脱离文档流，相对定位不会脱离文档流，绝对定位相对于该元素最近的已定位的祖先元素，如果没有一个祖先元素设置定位，那么参照物是body层。

## 清除浮动的方法（3种）

> flex布局成主流，不常用浮动，副作用有点大

- 空div：
    ```html
    <div style="clear:both;"></div>
    ```
- .clearfix类名（伪元素实现，其最后子元素的后面会添加一个clear的div）
    ```css
    .clearfix {
        &:after {
            content: '';
            display: block;
            width:0;
            height: 0;
            clear: both;
            visibility: hidden;
        }
    }
    // 或者
    &:after {
        content: '';
        display: table;
        clear: both;
    }
    ```
- BFC：父级添加overflow: auto或overflow: hidden


## flex布局
- 容器：
    - flex-direction 主轴方向 ： row/column/row-reverse/column-reverse
    - flex-wrap 换行:nowrap/wrap/wrap-reverse
    - flex-flow = flex-direction 和 flex wrap 
    - justify-content 主轴对齐 :flex-start/flex-end/center/space-between/space-around
    - align-items 交叉轴对齐:flex-start/flex-end/center/baseline(容器的基线)/stretch(默认)拉伸
    - align-content 多轴线对齐:flex-start/flex-end/center/space-between/space-around/stretch(默认)拉伸

- 项目：
    - order 顺序 越小越靠前 可为负
    - flex-grow 放大比例
    - flex-shrink 缩小比例
    - flex-basis 本身大小（相当于width、height）
    - flex 简写grow shink basis:auto（1 1 auto）
    - align-self 独自的对齐方式:auto(默认)/flex-start/flex-end/center/baseline/stretch 可重写自己的align-items

- flex和grid布局
    - 布局历程：表格布局 --> 定位布局 --> 浮动布局 --> flexbox布局 --> gridbox网格布局 
    - 目前移动端布局更多使用 flexbox 
    - flexbox 是一维布局，他只能在一条直线上放置你的内容区块；
    - grid是一个二维布局。它除了可以灵活的控制水平方向之外，还能轻易的控制垂直方向的布局模式，未来的布局。

## link和import的区别
- 区别：
    - 加载顺序：link标签引入的 CSS 被同时加载；@import引入的 CSS 将在页面加载完毕后被加载。
    - 兼容性：link无兼容问题，@import 是 CSS2.1 ，IE5以上才能识别
    - dom操作：js控制dom插入link标签来改变样式，dom无法控制@import
- link是html提供的标签
- 使用
    - 在html中使用
    ```html
    <link rel="stylesheet" type="text/css" href="./css/reset.css" />
    ```
- @import是css的语法规则 （可以看成css样式）
    - 用于其他样式表扩展
- 使用
    - 在html使用
    ```html
    <style type="text/css">
        @import url(CSS文件路径地址);
    </style>
    ```
    - CSS中使用
    ```css
    @import url(CSS文件路径地址);
    ```
    
## px、em、rem、vw、vh区别
- px ：pixel，像素，绝对单位，页面按精确像素展示。
- em：相对长度单位，基准点为父节点字体的大小，自身有的按自身算
- rem：相对长度单位，根em，相对根节点html的字体大小

    > rem是相对于根元素（html）的字体大小，而em是相对于其父元素的字体大小 
    
- vw、vh：视窗宽度/高度的1%,视窗宽高都是100vw/100vh

    > 类似百分比，不过百分比大部分针对父元素


## 管理CSS
- 如何选择：对外公共组件库，可用BEM。业务代码可用局部作用域。
- 1、BEM命名规范：
    - Bem 是块（block）、元素（element）、修饰符（modifier）的简写
        - 从类名可看出dom结构，更清晰，更语义化
        - 冗长的命名 减少了类名重复的可能性
    - 场景：有模块关系才用
    - 使用：block-name__element-name--color

        > __ 双下划线：连接子元素
    
        > -- 双横线：装饰或状态
    
    - 结合less、sass 的预处理器&符 简化冗长的命名
        ```css
        .form {  
         width: 12rem;  
         height: 6rem;
           
           &__input{
             font-size: 16px;
           }
           &__submit{    
             background: blue;
             &--disabled{
               background: gray;
             }
           }
        }
        // 编译成
        .form {  
         width: 12rem;  
         height: 6rem;
        }
        .form__input {  
         font-size: 16px;
        }
        .form__submit {  
         background: blue;
        }
        .form__submit--disabled {  
         background: gray;
        }
        ```

- 2、css modules
    - 通过hash实现类似于命名空间的方法，是唯一的
    - 在vue中模板中使用动态类绑定:class，并在类名前面加上'$style.'。style标签添加module属性`<style module>`，打开CSS-loader的模块模式，如果是自定义就去webpack配置
        ```html
        <template>
          <div :class="$style.bg">
            ...
          </div>
        </template>
        
        <style module>
        .bg {
          width: 100px;
          height: 100px;
          background-color: red;
        }
        </style>
        
        // 生成
        <div class="_3ylglHI_7ASkYw5BlOlYIv_0">...</span>
        ```
- 3、vue 中的scoped（局部作用域）
    - 原理：加上 scoped 属性的style会自动添加一个唯一的属性 。为不同的组件生成不同的属性选择器。
    - 比如data-v-0467f817为组件内 CSS 指定作用域，编译的时候 .errShow会被编译成类似 .errShow[data-v-0467f817]。
        ```html
        <span data-v-0467f817 class="errShow">用户名不得为空</span>
        
        .errShow[data-v-0467f817] {
            font-size: 12px;
            color: red;
        }
        ```
