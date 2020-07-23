## Vue全流程
![Vue全流程1](./img/frame-vueAll1.png)
![Vue全流程](./img/frame-vueAll.jpg)

> new Vue()调用init初始化 -> $mount挂载 -> compile()编译模板 -> render function -> 响应式系统 -> 视图更新

> 响应式系统：render -> touch -> getter -> Dep依赖收集Watcher；setter -> Dep.notify -> Watcher.update() -> patch()进行diff -> DOM

- 分为四个阶段：初始化、挂载编译、响应式、视图更新
  - 1、初始化：new Vue():调用init函数初始化，包括生命周期、事件、props、data、methods、watch等，还有重要就是Object.defineProperty设置setter和getter函数(同时将this.data.test代理成this.test)，用于依赖收集和响应式。
  - 2、编译挂载：初始化后调用$mount挂载组件，有template的情况下，内部执行compile()编译，包括  parse（解析template转成AST） 、  optimize(标记静态节点、用于diff优化跳过静态节点) 与  generate（AST -> render function） 三个阶段，最终得到 render function，用来渲染 VNode，然后生成真实DOM显示在页面上。
  - 3、响应式：render function 被渲染，读取所需对象的值，触发getter函数，执行依赖收集，将订阅者Watcher添加Dep订阅器中。修改对象的值时触发setter，通知Dep订阅器中的订阅者Watcher，需要重新渲染视图，然后Watcher调用update进行更新。
  - 4、视图更新：数据变化触发update后，执行 render function 得到新的 VNode 节点，与旧的 VNode 一起传入  patch 进行比较，经过 diff 算法得到「 差异」，根据差异来修改对应的DOM。

### 响应式系统
> 每个Vue组件都有对应的一个Watcher实例，如果一个属性在不同组件上都使用到，将把不同组件的Watcher都添加到这个属性的Dep订阅器中，表示这些视图依赖这个对象属性，如果发生改变，这些视图都要进行更新。一个Watcher可能在多个Dep中同时存在。

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
- Virtual DOM即虚拟DOM，是对DOM的抽象，本质是JS对象，可以轻量级描述DOM。
- 优点
    - 提高开发效率：不用手动操作DOM。
    - 利于性能优化：减少操作DOM，尽量一次性将差异更新到DOM，性能虽然不是最优，但比粗暴操作DOM要好得多。
    - 跨平台能力：虚拟DOM是JS对象，通过适配层如 nodeOps对象判断不同平台所封装的API（如Web，Weex，Node），提供相同的接口如增加节点、删除节点，使这棵树映射到真实平台环境上。
- 缺点
    - 虚拟DOM + 优化 可以满足大部分应用，但是对于性能要求高的，无法做到极致优化。

### 虚拟DOM的diff和key作用

![vue-diff](./img/vue-diff.png)

> vue和react的虚拟DOM的Diff算法大致相同

- 相同：树的分层对比
- 区别：节点diff时，react使用唯一key标记(对比是否需要增删移)，vue使用双指针。

- [React diff 知乎](https://zhuanlan.zhihu.com/p/20346379)

> vue和diff过程概述：通过Watcher的update产生新的虚拟DOM树，和旧虚拟DOM树一起传入patch函数，如果是sameVnode，内容存在且不同，进行updateChildren更新子节点。旧层级和新层级各有两个头尾的指针变量StartIdx和EndIdx，它们的2个变量相互比较，一共有4种比较方式：首首、尾尾、旧头新尾、旧尾新头，如果匹配上，指针对应的移动，如果4种比较都没匹配，如果设置了key，就会用key进行比较。整个diff的过程中，两个下标往中间靠，一旦其中一个的StartIdx>EndIdx表明oldCh和newCh至少有一个已经遍历完了，就会结束比较，将剩下的节点删除或者添加上去。

- 过程：patch（判断子节点是否为sameVnode）-> patchVnode（sameVnode进行对比内容是否相同）-> updateChildren（更新子节点，使用双指针和key进行对比更新）
- **patch(oldVnode,vnode,parentElm)函数：比对两个 VNode 节点，将「差异」更新到视图上，也就是以旧节点为基础，进行差异修改，增删一些DOM节点**。
    - 旧VNode节点不存在，则将新VNode节点全部添加到父节点parentElm上
    - 新VNode节点不存在，则将旧VNode节点全部移除
    - **旧VNode节点和新VNode节点都存在且为sameVnode时，进行patchVnode操作**

    > sameVnode:key、tag、是否注释、有无data、若为input的type类型 均一致。
    
    > 因为相对来说，oldVnode 自己对应的 dom总是已经存在的，新的vnode 的 dom 是不存在的，直接复用 oldVnode 对应的 dom，比如直接移动oldVnode。
    
- patchVnode操作：sameVnode时会执行，对比两个节点的子节点是否存在，子节点不同则需要更新子节点updateChildren，也就是进行双指针对比，进行更新下一层的节点。
    - 新旧VNode节点相同，直接返回
    - 新旧VNode节点都是在解析阶段标记的静态isStatic，且key相同，新的直接使用旧的内容，返回
    - 新VNode节点文本则直接设置text，否则比较新旧VNode节点的孩子节点
        - **新旧孩子节点都存在且不同，进行最核心的 updateChildren 也就是diff算法 更新子节点**
        - 只有新孩子节点，将新节点全部插入父节点下
        - 只有旧孩子节点，没有新孩子节点，将旧节点全部清除
- updateChildren：sameVnode且子节点存在不同，进行更新子节点。
    - 核心diff算法：**因为是同层的树节点进行比较，时间复杂度只需要O(n)**
    - 例子：重复下面的对比过程，直到新旧数组中任一数组的头指针超过尾指针，循环结束 :
        - 头头对比: 对比两个数组的头部，如果相同，进行patchVnode，不需要移动dom，直接更新属性或Children即可，双方头指针后移
        - 尾尾对比: 对比两个数组的尾部，如果相同，进行patchVnode，不需要移动dom，直接更新属性或Children即可，双方尾指针前移
        - 旧头新尾对比: 交叉对比，旧头新尾，如果相同，进行patchVnode，并把旧头节点移动到旧尾节点后面，完成当前节点差异更新，新尾指针前移，旧头指针后移
        - 旧尾新头对比: 交叉对比，旧尾新头，如果相同，进行patchVnode，并把旧尾节点移动到旧头节点前面，完成当前节点差异更新，旧尾指针前移，新头指针后移
        - 上面四种情况均不符合，则利用key对比: 用新指针对应节点的key去旧数组寻找对应的节点,这里分三种情况。
            - 当没有对应的key，那么创建新的节点，插入旧层级里，新头坐标后移一位；
            - 如果有对应的key并且是sameVnode，两个节点进行patchVnode，将该key对应的旧节点位置赋值undefined（防止 重复key），新头元素插入旧头元素前面，新头坐标后移一位；
            - 如果有对应的key但不是sameVnode，则创建新节点，插入旧层级里，新头坐标后移一位。
    - 循环结束后判断两个情况：
        - 旧头超过旧尾，旧数组比较完成，将新节点剩下的未遍历的节点调用addVnodes全部插入旧尾的真实DOM。
        - 新头超过新尾，新数组比较完成，将旧节点剩下的未遍历的节点调用removeVnodes全部删除。

- Vue中的key有什么用？
    - key是Vue标记vnode的唯一id
    - 作用：高效更新虚拟dom，diff操作更准确、更快速
    - 准确: 如果不加key，对于列表中每项都是sameVnode，那么vue会选择复用已经渲染好的旧节点(Vue的就地更新策略)，导致旧节点的子孙节点被保留下来，会产生一些隐藏的bug。
    - 快速: key的唯一性可以被Map数据结构充分利用，相比于遍历查找的时间复杂度O(n)，Map的时间复杂度仅仅为O(1)。
    - 举个例子：
      - 比如在列表中增加item，因为列表循环生成的节点都是sameVnode，所以直接复用前面的旧节点，一些旧节点内容保留，可能会出现数据错位的情况，在列表最后再插入新的item节点。
    ![vue-diff-nokey1](./img/vue-diff-nokey1.png)
    ![vue-diff-nokey2](./img/vue-diff-nokey2.png)
      - 用了key之后，能准确找到对应的位置，并插入，避免一些隐藏的bug。
    ![vue-diff-key](./img/vue-diff-key.png)

- 为什么不能使用index做key
    - 使用index还是会导致v-for结束后仍然是同样的顺序，仍会就地复用旧节点。

### Vue监测变化细粒度把控

- Vue的响应式系统是中等细粒度的方案，大量的Watcher会使内存开销过大，大量diff时间太久。所以采用组件Watcher + 内部Diff的方式
    - 在组件级别进行使用Watcher进行监测，对data进行依赖收集，一旦数据变化，就知道哪个位置发生变化。
    - 然后在组件内部进行Virtual Dom Diff算法，获取更加具体节点的差异。

- React中，我们用setState的API显式更新后，React知道发生变化后，然后暴力的Diff操作查找「哪发生变化了」，但是很多组件实际上是肯定不会发生变化的，这个时候需要用shouldComponentUpdate进行手动操作来减少diff，从而提高程序整体的性能。

- Angular则是脏检查操作。

### nextTick原理和队列
- 场景：在DOM更新结束之后执行延迟回调，在修改数据之后，视图并不会立即更新，在下一个循环开始前更新视图，获得更新后的 DOM，然后执行回调。
- 原理：nextTick函数传入callback，存储到callback数组队列中，下一个tick触发时执行队列所有的callback，清空队列。
- 实现：2.6新版本中默认优先是microtasks,再考虑macrotasks，都不支持则用setTimeout。 Promise.then(microtasks)【p.then(flushCallbacks)】 -> MutationObserver的回调(microtasks) -> setImmediate(ie&node macrotasks) -> setTimeout【setTimeout(flushCallbacks, 0)】

### 视图更新优化

>  为什么频繁变化但只会更新一次（一个number从0循环增加1000次，只更新至最后的值）

- 原理：放在异步队列中，下个tick更新视图。优化：同个Watcher在同个tick中只能被执行一次。队列中不应该出现重复的Watcher对象，也就是说，number的Watcher只会执行一次更新，就是从0 -> 1000
    - 执行++操作时，不断触发对应Dep中的Watcher 对象的 update 方法。
    - 如果一个Watcher对象触发多次，只push一次进异步队列queue中。
    - 下一个循环tick时，触发Watcher对象的run方法(执行patch)，执行更新DOM视图，number直接从0->1000
    - 先完成DOM更新后，执行排在后面的nextTick(callback)内的回调，nextTick是用户定义的其他操作，本质都是异步队列。
    
## Vue生命周期
- Vue 实例从创建到销毁的过程，就是生命周期。
- 从开始创建、初始化数据、编译模板、挂载DOM → 渲染、更新 → 渲染、销毁一系列过程
- 分为4个阶段：创建阶段(前/后), 挂载阶段(前/后), 运行阶段(更新前/后), 销毁阶段(前/后)。
- 周期：前四个钩子为第一次页面加载调用。
    - `beforeCreate`：刚创建Vue空实例，只有一些生命周期函数和默认事件，data、methods、el都不可访问。
    - `created`：完整的实例创建好，数据劫持完成，data、methods可访问、el不可访问，没有生成真实DOM。
    - `beforeMount`：完成编译模板的工作，生成一个render function并调用，生成虚拟DOM，没有生成真实DOM。
    - `mounted`：完成挂载，生成真实DOM，data、method可访问、el可访问。
    - `beforeUpdate`：data数据是新的，但页面是旧的，发生在虚拟 DOM 打补丁之前。适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。
    - `updated`：虚拟 DOM 重新渲染和打补丁，组件真实DOM更新之后，页面和data都是最新的。
    - `beforeDestroy`：组件销毁前调用，实例仍然完全可用。
    - `destroyed`：组件销毁后调用，解绑指令，移除监听，子组件销毁，都不可用。
    - keep-alive相关的：
      - `activated`：被keep-alive缓存的组件专属，组件被激活时调用
      - `deactivated`： 被keep-alive缓存的组件专属，组件被销毁时调用

- 关键节点简述
  - 创建阶段
    - `beforeCreate`：【data、methods、el均不可访问】
    - 中间执行：初始化 data、methods、props、computed、watcher、provide。
    - `created`：【data、methods可访问、el不可访问】【最早可访问data】
    ```js
    created() { 
      // 允许并推荐    
      this.$http.get(xxx).then(res => {
          this.data = res.data    
      })    
      // 不允许    
      this.$el    
      this.$ref.demo    
      const a = document.getElementById('demo')
    }
    ```
  - 挂载阶段
    - `beforeMount`：【data、methods可访问、el不可访问】
    - `mounted`：【data、methods可访问、el可访问】【最早可操作DOM】
    ```js
    mounted() {
        // 允许
        this.$el
        this.$ref.demo
        let a = document.getElementById('')
    }
    ```
  - 运行阶段：
    - `beforeUpdate`：【data数据是新的，但页面是旧的】
    - 中间执行：`re-render和patch`进行虚拟DOM的diff和更新渲染
    - `updated`：【data和页面都是最新的】
  - 销毁阶段
    - `beforeDestroy`：【实例的data、methods、指令完全可用】
    - `destroyed`：【实例的data、methods、指令都不可用】
    - 触发销毁钩子的方法
      - 手动调用`$destory()`
      - v-if 与 v-for 指令（v-show 不行）
      - 路由切换、关闭或刷新浏览器

![vue-created](./img/vue-created.png)

- 服务器端渲染：beforeCreate、created，其他不可调用

- 实践
    - 【异步请求】：官方推荐在mounted中调用的，实际上可以在created生命周期中调用。 服务端渲染时不支持mounted，需要放到created中。
    - 【最早访问data】：在created钩子中可以对data数据进行操作，可以进行ajax请求将返回的数据赋给data。
    - 【最晚修改data】：beforeMount，此时还未挂载到页面。
    - 【最早操作DOM】：在mounted钩子对挂载的DOM进行操作，此时，DOM已经被渲染到页面上。
    - 【updated函数注意】：在数据变化时被触发，但不能准确的判断是那个属性值被改变，可以用computed或watch函数来监听属性的变化，并做一些其他的操作。
    - 【缓存组件使用activated】：在使用vue-router时有时需要使用`<keep-alive></keep-alive>`来缓存组件状态，这个时候created钩子就不会被重复调用了，如果我们的子组件需要在每次加载或切换状态的时候进行某些操作，可以使用activated钩子触发。
    - 所有的生命周期钩子自动绑定 this 上下文到实例中，所以不能使用箭头函数来定义一个生命周期方法 (例如 `created: () => this.fetchTodos()`)。这会导致this指向父级。

- 父子组件渲染过程(子挂载完，父才算挂载完)
```
父beforeCreate->父created->父beforeMount->
子beforeCreate->子created->子beforeMount->子mounted->父mounted
```
- 子组件更新过程(通过props传递，或者vuex等存在数据流向触发时)
```
父beforeUpdate->子beforeUpdate->子updated->父updated
```
- 父组件更新过程(自身组件更新，自己组件的生命周期)
```
父beforeUpdate->父updated
```
- 销毁过程 
```
父beforeDestroy->子beforeDestroy->子destroyed->父destroyed
```

## Vue组件通信
- [Vue组件通信的方法如下:](https://juejin.im/post/5d267dcdf265da1b957081a3#heading-0)

- props/$emit+v-on: 父子通信：通过props将数据自上而下传递，而通过$emit和v-on(@)来向上传递信息。

- vuex: 是全局数据管理库，可以通过vuex管理全局的数据流
    - **场景：项目复杂时，多个视图依赖于同一状态、来自不同视图的行为需要变更同一状态**
    - state：状态中心，用于数据的存储，是store中的唯一数据源，其他组件读取this.$store.state.A
    - getters：获取状态，如vue中的计算属性，基于state数据的二次包装，常用于数据的筛选和多个数据的相关性计算
    - mutations：更改状态，类似函数，改变state的唯一途径，且不能处理异步事件，触发状态改变this.$store.commit('test',{ A：'a' })
    - actions：异步更改状态，类似于mutation，用于提交mutation来改变状态，而不直接变更状态，可以处理任意异步事件
    - modules：: 将state分成多个modules,类似于命名空间，用于项目中将各个模块的状态分开定义和操作，便于维护
    - vuex结合localStorage持久化数据
        - vuex里数据改变的时候把数据保存到localStorage里面
        - 刷新后，localStorage里如果有保存的数据，取出来替换store里的state。
        ```js
        let defaultCity = "上海"
        try {   // 用户关闭了本地存储功能，此时在外层加个try...catch
          if (!defaultCity){
            defaultCity = JSON.parse(window.localStorage.getItem('defaultCity'))
          }
        }catch(e){}
        export default new Vuex.Store({
          state: {
            city: defaultCity
          },
          mutations: {
            changeCity(state, city) {
              state.city = city
              try {
              window.localStorage.setItem('defaultCity', JSON.stringify(state.city));
              // 数据改变的时候把数据拷贝一份保存到localStorage里面
              } catch (e) {}
            }
          }
        })

        ```
- EventBus: 兄弟组件或跨级：事件总线：所有组件的共同事件中心，通过EventBus进行信息的发送和监听
    - 不适用多人协作和大项目，较难维护。 
    - 组件没有同时显示不应该用eventbus，一般需要先on再emit。比如两个路由一个还没创建，所以监听不到。而应该使用vuex。
```js
// event-bus.js

import Vue from 'vue'
export const EventBus = new Vue()           // 注册事件总线
import { EventBus } from './event-bus.js'   // 组件引入
EventBus.$emit('test',{ num : this. num }) // A组件发送事件
EventBus.$on('test',param => { })          // B组件接收事件
EventBus.$off('test', { })                 // 移除监听 
```

- provide/inject：跨级：父组件中通过**provide来提供变量, 然后再子孙后代组件中通过inject来注入变**量。不论组件层次有多深，并在起上下游关系成立的时间里始终生效。
    ```js
    provide() {
        return {
          user: this.user
        }
    },
      
    inject: ['user'],
    ```
- $attrs/$listeners: 跨级： Vue2.4中加入的$attrs/$listeners，$attrs含有父作用域**不被prop识别的特性**（class和style除外），$listeners包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器，并且可以通过v-bind="$attrs/$listeners"继续传入内部组件,传递下去。
    - 适合仅传递数据的跨级通信，用vuex是大材小用。

- localStorage / sessionStorage
    - 数据和状态比较混乱，不好维护，不过可以结合vuex, 实现数据的持久保存
    - window.localStorage.getItem(key)获取数据 
    - 通过window.localStorage.setItem(key,value)存储数据
    - JSON.parse() / JSON.stringify() 做数据格式转换


## Vue事件机制
- 四个事件API，分别是$on，$once，$off，$emit。
- `$on( event, callback )`
  - 监听当前实例上的自定义事件。事件可以由 vm.$emit 触发，在模板上可使用v-on:event="fn"。
- `$once( event, callback )`
  - 监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。
- `$off( [event, callback] )`
  - 移除自定义事件监听器。没有参数移除所有监听器；只提供了事件，则移除该事件所有的监听器；提供了事件与回调，则只移除这个回调的监听器。
- `$emit( eventName, […args] )`
  - 触发当前实例上的事件。附加参数都会传给监听器回调。

```js
vm.$on('test', function (msg) {
  console.log(msg)
})
vm.$emit('test', 'hi')
// => "hi"
```

- 手写解析：
  - on判断事件是数组则遍历执行on方法，不是则将对应的fn回调push进对应事件名的事件调度中心events数组。
  - once封装一下on回调（执行一次fn回调时，调用off方法关闭监听），然后调用on方法将on回调push进对应事件名的事件调度中心events数组。
  - off判断事件是数组则遍历执行off方法，不是则判断有无传入fn回调，没传则清空该事件所有的回调函数events中的fn。有传fn回调，则移除在events上对应的fn回调。
  - emit取出对应events中的fn回调，遍历执行所有注册的fn回调。


```js
class Vue {
  constructor() {
    this._events = Object.create(null);
  }
  $on(event, fn) {
    if (Array.isArray(event)) {
      event.map(item => {
        this.$on(item, fn);
      });
    } else {
      (this._events[event] || (this._events[event] = [])).push(fn);
    }
    return this;
  }
  $once(event, fn) {
    function on() {
      this.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  }
  $off(event, fn) {
    if (!arguments.length) {
      this._events = Object.create(null);
      return this;
    }
    if (Array.isArray(event)) {
      event.map(item => {
        this.$off(item, fn);
      });
      return this;
    }
    const cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (!fn) {
      this._events[event] = null;
      return this;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  }
  $emit(event) {
    let cbs = this._events[event];
    if (cbs) {
      const args = [].slice.call(arguments, 1);
      cbs.map(item => {
        args ? item.apply(this, args) : item.call(this);
      });
    }
    return this;
  }
}
```

## Vue双向绑定v-model
vue 项目中主要使用 v-model 指令在表单 input、textarea、select 等元素上创建双向数据绑定，我们知道 v-model 本质上不过是语法糖，v-model 在内部为不同类型的标签，绑定不同的属性并传入，并抛出不同的事件：

- input 和 textarea 元素使用 value 属性和 input 事件；
- checkbox 和 radio 使用 checked 属性和 change 事件；
- select 字段将 value 作为 prop 并将 change 作为事件。

- 例子：

    ```html
    <input v-model='something'>
        
    相当于绑定value属性传入组件内部，并监听组件内部emit出来的input事件
    
    <input v-bind:value="something" v-on:input="something = $event.target.value">
    ```
- 自定义组件：v-model 默认会利用名为 value 的 prop 和名为 input 的事件

    ```html
    父组件：
    <MyInput v-model="message"></MyInput>
    
    子组件：
    <div>{{value}}</div>
    
    props:{
        value: String
    },
    methods: {
      test() {
         this.$emit('input', '元气')
      },
    }
    ```

## options

### data为什么是函数
- 组件被复用时，会创造多个实例。
- 它们来自同个构造函数，如果data是对象，也就是引用类型，会影响到所有实例。
- 为了防止实例间data的冲突，将data变为函数，用return返回值，让每个实例维护一份返回对象的独立拷贝。

### computed和watch的区别
- computed
    - 是计算属性，依赖其他属性值来计算，将复杂逻辑放在计算属性中而不是模板。
    - 有缓存性，依赖属性值改变后，下次获取computed的值时才会重新调用对应的getter来计算。
- watch
    - 观察作用，基于某些数据的监听回调，深度监听对象中的属性，deep：true选项
    - 无缓存性，页面重新渲染时，值不变化也会执行。
- 场景
    - 依赖于其他数据的数值计算时，使用computed
    - 某个数据变化时做某些异步操作（请求API），使用watch

## 常见指令
### v-if、v-show
- v-if
    - v-if如果不成立不会生成对应的vnode，render时不会渲染
    - 场景：适合条件很少变化的数据
    - 切换开销高
- v-show
    - v-show会直接生成vnode，render时也会被渲染，render过程修改display属性值
    - 场景：适合频繁切换的数据
    - 初始开销高

### v-html

- 原理：
    - v-html移除节点所有的内容，添加innerHTML属性，内容为v-html里的内容。

## Vue2.x 检查数组变化
- 本质：Object.defineProperty无法监听到数组内部变化、也无法探测普通对象新增的属性(`this.myObject.newProperty = 'hi'`)
- 方案：Vue采用hack的方法实现数组监听
  ```js
  push()
  pop()
  shift()
  unshift()
  splice()
  sort()
  reverse()
  ```
- 原理：Vue采用改变数组实例的原型对象，指向自己构造的原型对象。
  - 1.将新加入的对象响应式化
  - 2.数组本来的API方法如push、pop，通过`apply(this, args)`执行。
  - 3.dep.notify()提醒观察(订阅)者进行更新。
- 直接`vm.items[indexOfItem] = newValue`是无法检测到的，length属性不能监听因为无法触发obj的get方法。
- 另外的方法：
  - 实例的$set方法【vm.$set( target, propertyName/index, value )】
  - 或者全局API 【Vue.set( target, propertyName/index, value )】：向响应式对象中添加一个 属性property，并确保这个新 property 同样是响应式的，且触发视图更新。
- 最好方案：Vue3.0采用Proxy监听对象和数组

## Vue 路由
- mode模式有三种（页面不重新加载，只切换显示的组件）
    - hash：【兼容性好、URL不美观】
        - hash就是URL中#号后面的内容，改变hash会向浏览器添加记录。
        - 通过location.hash改变hash，用hashchange监听，然后跳转，创建一个history保存记录自己维护，点击前进后退可切换历史hash。
        - 原理：用一个routes对象存储路由，定义route方法，保存每个hash对应的回调方法，监听hashchange，有变化就执行对应location.hash的回调函数，进行刷新。
    - history：【兼容性一般、URL美观】
        - 使用HTML5提供history.pushState、history.repalceState 等 API ，不刷新页面的情况下，操作浏览器的历史记录（如新增、替换），他们都会使当前地址URL进行变更，区别只是有无往历史记录添加此地址。
        - popstate 事件来监听 url 的变化（浏览器前进后退按钮或JS触发history.back(),history.forward()等方法会触发popstate），执行监听回调，进行页面进行跳转（渲染）
        - 但是history.pushState、history.repalceState不会触发popstate 事件，我们需要手动触发路由的回调，进行跳转，切换显示内容。
        - 原理：初始化路由使用repalceState该路径并执行该路径的回调，定义go方法，执行pushState并手动执行回调，进行刷新。
        - 这个模式**有坑要注意**：服务器没有对应路径的资源会直接返回404，所以需要服务器进行配置，对匹配不到的资源路径要返回index.html，也就是我们APP依赖的页面，根据当前url匹配对应的路由，去执行对应的回调和显示。然后前端需要先配置404路由，放在路由列表最后。如果当所有路由匹配不到，就进入我们自己的404页面。
        ```js
        // http://mozilla.org/foo.html 
        let stateObj = {
            foo: "bar",
        };
        history.pushState(stateObj, "page 2", "bar.html");
        // 状态对象、标题、URL路径(相对或绝对)
        // http://mozilla.org/bar.html, 但并不会导致浏览器加载 bar.html
        ```
    - abstract：没有浏览器api，进入此模式。如Node.js服务器
- 跳转
    - `this.$router.push()`
    - `<router-link to=""></router-link>`
- 占位
    - `<router-view></router-view>`
- 路由懒（按需）加载
    - 没配置路由懒加载的情况下，我们的路由组件在打包的时候，都会打包到同一个js文件去，导致越来越大，请求时间变长
    - 把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应的组件， 首屏时不用加载过度的资源，从而减少首屏加载速度。
    - import()方法由ES6提出，import()方法是动态加载。
    ```js
    // webpack< 2.4 时
    {
      path:'/',
      name:'home',
      components:resolve=>require(['@/components/home'],resolve)
    }
    
    // webpack> 2.4 时
    {
      path:'/',
      name:'home',
      components:()=>import('@/components/home')
    }
    ```

### 实现原理

> react-router/vue-router都是基于前端路由的拓展和封装，原理有两种，hash和history

> 回调指的是对应的路由路径，执行对应的页面跳转，或渲染对应的页面。
    ```js
    Router.route('/', function() {
      changeBgColor('yellow');
    });
    ```

- hash
    - 优点：兼容性好
    - 缺点：#符合不够美观，原理像Hack
    - 步骤：
        - 简版：不带前进/回退
        - 完整：创建一个history保存记录，创建index指针指向前进后退的位置，定义后退方法，通过location.hash设置回对应的hash，再执行刷新方法执行回调。
        ```js
        // 简版
        class Routers {
          constructor() {
            // 保存对应路径和回调
            this.routes = {};
            // 当前url
            this.currentUrl = '';
            this.refresh = this.refresh.bind(this);
            // 监听路由hash变化
            window.addEventListener('load', this.refresh, false);
            window.addEventListener('hashchange', this.refresh, false);
          }
            // route方法定义回调
          route(path, callback) {
            // 将path路径与对应的callback函数储存
            this.routes[path] = callback || function() {};
          }
            // 刷新方法，执行回调
          refresh() {
            this.currentUrl = location.hash.slice(1) || '/';
            this.routes[this.currentUrl]();
          }
        }
        
        html：
        <li><a href="#/blue">turn blue</a></li>
        <li><a href="#/green">turn green</a></li>
        js:
        window.Router = new Routers();
        Router.route('/blue', function() {
          changeBgColor('blue');
        });
        Router.route('/green', function() {
          changeBgColor('green');
        });
        ```
- history
    - 优点：url美观,实现简洁
    - 缺点：HTML5 兼容性一般 IE10+ Chrome：5+
    - 实现：
        - 跳转history.pushState(添加历史记录,修改当前url,不跳转，执行回调)
        - 初始化history.replaceState(不加历史记录,修改当前url地址，执行回调)
        - 监听popstate(监听回退和前进,触发pop,执行路由回调)
        - 触发popstate：只有用户点击浏览器倒退按钮和前进按钮，或者使用 JavaScript 调用back、forward、go方法时才会触发。
        ```js
        class Routers {
          constructor() {
            this.routes = {};
            // 在初始化时监听popstate事件
            this._bindPopState();
          }
          // 初始化路由
          init(path) {
            history.replaceState({path: path}, null, path);
            this.routes[path] && this.routes[path]();
          }
          // 将路径和对应回调函数加入hashMap储存
          route(path, callback) {
            this.routes[path] = callback || function() {};
          }
        
          // 判断链接被点击，触发go函数，执行路由对应回调
          go(path) {
            history.pushState({path: path}, null, path);
            this.routes[path] && this.routes[path]();
          }
          // 监听popstate事件
          _bindPopState() {
            window.addEventListener('popstate', e => {
              const path = e.state && e.state.path;
              this.routes[path] && this.routes[path]();
            });
          }
        }
        ```

### 路由守卫

## React和Vue的区别
## Vuex 的原理
## keep-alive
## mixin混入

## Vue3.0重要特性
#### 采用proxy劫持对象

#### Proxy与Object.defineProperty的优劣对比?
- 基于数据劫持的双向绑定有两种实现
    - 一个是目前Vue在用的Object.defineProperty
    - 另一个是Vue3.0即将加入的ES2015中新增的Proxy
- Proxy的优势
    - 可以直接监听对象(Object.defineProperty遍历对象里面的属性，属性是对象还得深度遍历)
    - 可以直接监听数组的变化(Object.defineProperty无法监听)
    - Proxy作为新标准将受到浏览器厂商重点持续的性能优化
- Object.defineProperty的优势:
    - 兼容性好,支持IE9(不能兼容IE8及以下)。而Proxy 的存在浏览器兼容性问题，且无法用 polyfill 磨平，所以在Vue3.0才能引入这个破坏性改变。
    - 缺点：只能劫持对象的属性,需要对每个对象的每个属性进行遍历，如果属性值也是对象那么需要深度遍历。

#### Composition API
#### Tree-shaking
#### Diff算法优化
#### Vue3.0 对比Vue2.0的优势在哪？

## MVVM与MVC
![MVVM](./img/MVVM.png)
- 全称MVVM：Model–View–ViewModel；全称MVC：Model–View–Controller（MVC）
- 核心是ViewModel 层：向上与视图层进行双向数据绑定，向下与Model层请求接口如Ajax进行数据交互。
- 层级介绍：
    - View 是视图层，也就是用户界面。前端主要由 HTML 和 CSS 来构建布局和结构 。
    - Model 是指数据模型，泛指后端进行的各种业务逻辑处理和数据操控对于前端来说就是后端提供的 api 接口。
    - ViewModel 是由前端开发人员组织生成和维护的视图数据层，对于Model数据进行处理和封装，生成符合View层使用。
- 优点：
    - 自动更新DOM：ViewModel的内容实时展示在View层，不需要操作DOM更新视图。
    - 降低耦合：ViewModel解耦View 层和 Model 层，前后端分离的基础。
- 缺点：
    - Bug很难被调试：界面异常有可能是View有Bug，或者是Model代码有问题。不容易定位。
    - 大型图形应用维护成本高：视图状态较多，ViewModel的构建和维护的成本都会比较高

## 单页(SPA)和多页(MPA)的区别
- 单页：只有一个主页面html，局部刷新，只加载一次公共资源(js、css)，每次跳转只是切换显示的组件。
- 多页：多个独立页面html，整页刷新，每个页面都要加载公共资源(js、css)。
- 场景：对体验和流程度要求高的使用单页，对SEO要求较高使用多页。
    - 路由模式：**单页是hash或者history**，多页是普通链接跳转。
    - SEO: 单页较差，页面内容等待异步获取(需要单独方案如SSR、预渲染)，多页较好，较多静态内容(实现方法简单)。
    - 体验：单页切换快，多页切换慢。
    - 数据传递：单页Vuex即可，多页使用缓存(localStorage)或URL参数等。
    - 成本：单页开发成本高要用框架，维护简单。多页前期开发成本低，维护麻烦，一个功能改动需要多处更改。
- SEO优化
  - 网站设计优化：关键词、布局、代码拼写
  - 网站内容优化：栏目关键词、分析用户需求的内容

## 【观察者】和【发布-订阅】模式的区别
相同：都是某个对象(subject, publisher)改变，使依赖于它的多个对象(observers, subscribers)得到通知。
不同：
- 观察者模式【subject-observers】：
    - 主体和观察者是互相感知的
    - 例子：奶农和个人
- 发布-订阅模式【publisher-subscribers】：
    - 发布者和订阅者是互不感知的，它们借助第三方来实现调度的。
    - 例子：像报社，邮局，个人，第三方就是邮局，负责报纸的订阅和发放。
    - Vue中发布-订阅中的dep(邮局)，负责添加订阅者watcher(个人)，一旦发生修改(报社更新)，通知更新。
    - 适合更复杂的场景

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

