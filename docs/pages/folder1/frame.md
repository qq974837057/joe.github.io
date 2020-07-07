## Vue全流程
![Vue全流程](./img/frame-vueAll.jpg)

> new Vue()调用init初始化 -> $mount挂载 -> compile()解析编译 -> render function -> 响应式系统

> 响应式系统：render -> touch -> getter -> Dep依赖收集Watcher；setter -> Dep.notify -> Watcher.update() -> patch()进行diff -> DOM

- 分为四个阶段：初始化、挂载编译、响应式、视图更新
  - 1、初始化：new Vue():调用init函数初始化，包括生命周期、事件、props、data、methods、watch等，还有重要就是Object.defineProperty设置setter和getter函数，用于依赖收集和响应式。
  - 2、挂载编译：初始化后调用$mount挂载组件，执行compile()模板解析，包括  parse（解析template转成AST） 、  optimize(标记静态节点、用于diff优化跳过静态节点) 与  generate（AST -> render function） 三个阶段，最终得到 render function，用来渲染 VNode 
  - 3、响应式：render function 被渲染，读取所需对象的值，触发getter函数，执行依赖收集，将订阅者Watcher添加Dep订阅器中。修改对象的值时触发setter，通知Dep订阅器中的订阅者Watcher，需要重新渲染视图，然后Watcher调用update进行更新。
  - 4、视图更新：数据变化触发update后，执行 render function 得到新的 VNode 节点，与旧的 VNode 一起传入  patch 进行比较，经过 diff 算法得到「 差异」，根据差异来修改对应的DOM。

### 响应式系统
> 每个Vue组件都有对应的一个Watcher实例，如果一个属性在不同组件上都使用到，将把不同组件的Watcher都添加到这个属性的Dep订阅器中，表示这些视图依赖这个对象属性，如果发生改变，这些视图都要进行更新。

- 简述：基于[数据劫持+发布者-订阅者模式]，分三个步骤：数据劫持、依赖收集、通知订阅者进行更新
- 步骤：
  - 1、**数据劫持**：Vue构造函数中，Vue上的data的每个属性会被 Object.defineProperty方法添加getter和setter属性。在vue3.0中通过Proxy代理对象进行类似的操作。
      ```js
      Object.defineProperty(obj, prop, descriptor)
      
      obj:劫持对象
      prop:对象的属性
      descriptor的属性有：
      enumerable ，属性是否可枚举，默认 false。
      configurable ，属性是否可以被修改或者删除，默认 false。
      get ，获取属性的方法。
      set ，设置属性的方法。
      ```
  - 2、**依赖收集：** 劫持data后，根据前面解析器Compile新建的Watcher订阅者实例，在执行组件渲染render时候，data被Touch(被读)，getter函数调用，进行依赖收集，执行dep.addSub，将Watcher（订阅者）对象实例添加进当前属性自己的Dep（订阅器）中进行订阅。
  - 3、**通知订阅者进行更新**：data改动(被写)时， setter 方法被调用, 执行dep.notify通知自己属性的订阅器Dep中的每一个Watcher订阅者数据有变化，触发Watcher订阅者对象自己的update方法，也就是所有依赖于此 data 的组件视图去调用他们的 update 和 render 函数进行更新视图。



### 虚拟DOM的优缺点
### 虚拟DOM的diff和key作用
### Vue监测变化细粒度把控
### nextTick原理和队列
### 视图更新优化
- 为什么频繁变化但只会更新一次

## Vue生命周期

## Vue组件通信

## Vue事件机制

## Vue双向绑定v-model

## options
### data为什么是函数
### computed和watch的区别

## 常见指令
### v-if、v-show
### v-html

## Vue2.x 检查数组变化
## Vue3.0 

## Vue 路由
### 原理
### 路由守卫

## React和Vue的区别
## Vuex 的原理

## Vue3.0重要特性
#### 采用proxy劫持对象
#### Composition API
#### Tree-shaking
#### Diff算法优化
#### Vue3.0 对比Vue2.0的优势在哪？

## MVVM与MVC
## 单页(SPA)和多页(MPA)
## 观察者模式和发布-订阅模式的区别

## Vue的插槽理解
- [来自掘金](https://juejin.im/post/5ef6d1325188252e75366ab5#heading-1)

- 默认插槽
  - 一居室中默认插槽摆家具
  ```html
  <!-- 组件内部 -->
  <template>
    <!--这是一个一居室-->
    <div class="one-bedroom">
      <!--添加一个默认插槽，用户可以在外部随意定义这个一居室的内容-->
      <slot></slot>
    </div>
  </template>
  ```
  ```html
  <!-- 使用组件 -->
  <template>
    <!--这里一居室-->
    <one-bedroom>
      <!--将家具放到房间里面，组件内部就是上面提供的默认插槽的空间-->
      <span>先放一个小床，反正没有女朋友</span>
      <span>再放一个电脑桌，在家还要加班写bug</span>
    </one-bedroom>
  </template>

  <script>
  import OneBedroom from '../components/one-bedroom'
  export default {
    components: {
      OneBedroom
    }
  }
  </script>
  ```

- 具名插槽
  - 两居室使用name="desc"进行区分两个插槽，一个不带 name 的 `<slot> `出口会带有隐含的名字“default”。不指定具体name的插槽内容将传入默认slot中。
  ```html
  <!-- 组件内部 -->
  <template>
    <div class="two-bedroom">
      <!--这是主卧-->
      <div class="master-bedroom">
        <!---主卧使用默认插槽-->
        <slot></slot>
      </div>
      <!--这是次卧-->
      <div class="secondary-bedroom">
        <!--次卧使用具名插槽-->
        <slot name="secondard"></slot>
      </div>
    </div>
  </template>
  ```

  ```html
  <!-- 使用组件 -->
  <template>
    <two-bedroom>
      <!--主卧使用默认插槽-->
      <div>
        <span>放一个大床，要结婚了，嘿嘿嘿</span>
        <span>放一个衣柜，老婆的衣服太多了</span>
        <span>算了，还是放一个电脑桌吧，还要写bug</span>
      </div>
      <!--次卧，通过v-slot:secondard 可以指定使用哪一个具名插槽， v-slot:secondard 也可以简写为 #secondard-->
      <template v-slot:secondard>
        <!-- vue3将只支持v-slot在template传入，目前仍可用2.6.0起废弃的 slot来传入  <div slot="secondard"> </div>  -->
        <div>
          <span>父母要住，放一个硬一点的床，软床对腰不好</span>
          <span>放一个衣柜</span>
        </div>
      </template>
    </two-bedroom>
  </template>
  <script>
  import TwoBedroom from '../components/slot/two-bedroom'
  export default {
    components: {
      TwoBedroom
    }
  }
  </script>
  ```

- 作用域插槽
  - 组件内部向外传递参数，外部可根据参数来传入对应内容
  ```html
  <!-- 组件内部 -->
  <template>
    <div class="two-bedroom">
      <!--其他内容省略-->
      <div class="toilet">
        <!--通过v-bind 可以向外传递参数, 告诉外面卫生间可以放洗衣机-->
        <slot name="toilet" v-bind="{ washer: true }"></slot>
      </div>
    </div>
  </template>
  ```

  ```html
  <!-- 使用组件 -->
  <template>
    <two-bedroom>
      <!--其他省略-->
      <!--卫生间插槽，通过v-slot="scope"可以获取组件内部通过v-bind传的值-->
      <template v-slot:toilet="scope">
        <!--判断是否可以放洗衣机-->
        <span v-if="scope.washer">这里放洗衣机</span>
      </template>
    </two-bedroom>
  </template>
  ```

- 插槽的默认值
  - 装修好的房子里已经有默认的家具，不传入插槽，则用默认的插槽内容。
  ```html
  <!-- 组件内部 -->
  <template>
    <div class="second-hand-house">
      <div class="master-bedroom">
        <!--插槽可以指定默认值，如果外部调用组件时没有修改插槽内容，则使用默认插槽-->
        <slot>
          <span>这里有一张水床，玩的够嗨</span>
          <span>还有一个衣柜，有点旧了</span>
        </slot>
      </div>
      <!--这是次卧-->
      <div class="secondary-bedroom">
        <!--次卧使用具名插槽-->
        <slot name="secondard">
          <span>这里有一张婴儿床</span>
        </slot>
      </div>
    </div>
  </template>
  ```
  
  ```html
  <!-- 使用组件 -->
  <second-hand-house>
    <!--主卧使用默认插槽，只装修主卧-->
    <div>
      <span>放一个大床，要结婚了，嘿嘿嘿</span>
      <span>放一个衣柜，老婆的衣服太多了</span>
      <span>算了，还是放一个电脑桌吧，还要写bug</span>
    </div>
  </second-hand-house>
  ```

