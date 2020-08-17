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
- 区别：节点diff时，react15.x使用唯一key标记，且整个新老数据对比是否需要增删移，vue使用双指针，减少节点移动次数，且组件级别采用watcher通知，内部采用diff，避免watcher太多带来性能开销。

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
- 场景：下一个循环：在DOM更新结束之后，执行nextTick()中的回调，在修改数据之后，视图并不会立即更新，在下一个循环更新视图，获得更新后的 DOM，然后执行回调。
- 原理：nextTick函数传入callback，存储到callback数组队列中，下一个tick触发时执行队列所有的callback，清空队列。
- 实现：2.6新版本中默认优先是microtasks,再考虑macrotasks，都不支持则用setTimeout。 Promise.then(microtasks)【p.then(flushCallbacks)】 -> MutationObserver的回调(microtasks) -> setImmediate(ie&node macrotasks) -> setTimeout【setTimeout(flushCallbacks, 0)】
  ```js
  // 修改数据
  this.message = 'changed'
  // DOM 还没有更新
  this.$nextTick(function () {
    // DOM 现在更新了
  })
  ```
- 全局API
  ```js
  // 修改数据
  vm.msg = 'Hello'
  // DOM 还没有更新
  Vue.nextTick(function () {
    // DOM 更新了
  })

  // 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
  Vue.nextTick()
    .then(function () {
      // DOM 更新了
    })
  ```
### 视图更新优化

>  为什么频繁变化但只会更新一次（一个number从0循环增加1000次，只更新至最后的值）

- 原理：Vue视图更新DOM是异步执行的，检测到数据有变化，Vue开启一个异步队列，下个tick更新视图。同一个 watcher 被多次触发，只会被推入到队列中一次。也就是说，number的Watcher只会执行一次更新，就是从0 -> 1000。
    - 重点：先完成DOM更新后，执行排在后面的nextTick(callback)内的回调，nextTick是用户定义的其他操作，本质都是异步队列，只是视图更新在它前面。
    - 执行++操作时，不断触发对应Dep中的Watcher 对象的 update 方法。
    - 如果一个Watcher对象触发多次，只push一次进异步队列queue中。
    - 下一个循环tick时，触发Watcher对象的run方法(执行patch)，执行更新DOM视图，number直接从0->1000
    
## Vue生命周期
- Vue 实例从创建到销毁的过程，就是生命周期。
- 从开始创建、初始化数据、编译模板、挂载DOM → 渲染、更新 → 渲染、销毁一系列过程
- 分为4个阶段：创建阶段(前/后), 挂载阶段(前/后), 运行阶段(更新前/后), 销毁阶段(前/后)。
- 周期：前四个钩子为第一次页面加载调用。
    - `beforeCreate`：刚创建Vue空实例，只有一些生命周期函数和默认事件，data、methods、el都不可访问。
    - `created`：完整的实例创建好，数据劫持完成，data、methods可访问、el不可访问，没有生成真实DOM。
    - `beforeMount`：已经完成编译模板的工作，生成一个render function并调用，生成虚拟DOM在内存中，没有生成真实DOM。
    - `mounted`：完成挂载，生成真实DOM，页面显示内容，data、method可访问、el可访问。
    - `beforeUpdate`：data数据是新的，但页面是旧的，发生在虚拟 DOM 打补丁之前。适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。
    - `updated`：虚拟 DOM 重新渲染和打补丁，组件真实DOM更新之后，页面和data都是最新的。更新完成后，如果有nextTick回调，会在视图更新后执行。
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
    - `beforeMount`：【data、methods可访问、el不可访问】【虚拟DOM编译好在内存中，还未挂载】
    - `mounted`：【data、methods可访问、el可访问】【最早可操作DOM】【页面已显示】
    ```js
    mounted() {
        // 允许
        this.$el
        this.$ref.demo
        let a = document.getElementById('')
    }
    ```
  - 运行阶段
    - `beforeUpdate`：【数据更新后执行】【data数据是新的，但页面是旧的】
    - 中间执行：`re-render和patch`进行虚拟DOM的diff和更新渲染
    - `updated`：【视图更新完执行】【data和页面都是最新的】
  - 销毁阶段
    - `beforeDestroy`：【实例的data、methods、指令完全可用】
    - `destroyed`：【实例的data、methods、指令都不可用】
    - 触发销毁钩子的方法
      - 手动调用`$destory()`
      - v-if 与 v-for 指令（v-show 不行）
      - 路由切换、关闭或刷新浏览器

![vue-created-write](./img/vue-created-write.png)
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
> Vue Router 的导航方法 (push、 replace、 go) 在各类路由模式 (history、 hash 和 abstract) 下表现一致。
  - 声明式`<router-link to=""></router-link>`
  - 编程式`this.$router.push('home')`
  - 前进后退`router.go(1)/router.go(-1)`
  - 替换history的当前记录`router.replace(...)`

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

### 路由(导航)守卫
用于路由跳转前做一些逻辑处理，确定下一步要跳转的路由地址。
- 如全局前置守卫：beforeEach，to表示将要跳转去的路由，from表示正要离开的路由，next()方法用来执行resolve这个钩子，进行下一步跳转。
  - next() 下一个钩子，全部钩子执行完就跳转到to地址
  - next('/') 跳到指定地址
  - next(false) 中断当前导航，回到from地址
  - next(error) 传入error实例，传递到router.onError()的回调
```js
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```
- 应用：判断未登录则跳转去登录页
```js
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  else next()
})
```
- 此外还有全局后置钩子afterEach:不会接受 next 函数也不会改变导航本身
```js
router.afterEach((to, from) => {
  // ...
})
```

## React和Vue的区别
> 相同的有：虚拟DOM、组件化、核心库和功能库分开；

> 不同的有：改变视图数据、组件更新的方式、Vue推荐模板template、React推荐JSX、Vue上手成本低、且新建项目CLI可配置。

- 相同：
    - 虚拟DOM
    - 组件化的架构
    - 核心库和其他功能库(如路由和状态管理库)
- 不同：
    - 改变数据：Vue不需要想React那样setState改变状态，是响应式渲染页面的。
        - 数据劫持优势1：无需显示调用，Vue运用数据劫持+发布订阅,直接通知变化并驱动视图,，react则需要显示调用setState
        - 数据劫持优势2：精确得知变化数据newVal
    - 组件更新：Vue是收集依赖，精确知道哪个组件要更新，React需要手动shouldComponentUpdate来表示该组件应该更新，较难优化。
    - Template和JSX： React 中只能使用 JSX 的渲染函数。Vue推荐使用模板(单文件组件)，可以在偏视图组件使用模板，偏逻辑组件使用JSX或渲染函数。
    - 新建项目：Vue 提供了 CLI 脚手架，可选择适合自己的模板。React 在这方面也提供了 create-react-app，项目生成时不允许配置，只有默认生成单页应用的选项。
    - 上手成本：React需要知道 JSX 和 ES2015，成本较高，Vue起步看指南即可建立简单应用。
    - 原生渲染：Vue对应weex，React对应React Native，实现平台开发。
    - Vue 设置样式的默认方法是单文件组件里类似 style 的标签， React 中是通过 CSS-in-JS 的方案。

- Vue的优势是：【模板写法，上手简单】
    - 模板和渲染函数的弹性选择
    - 简单的语法和项目配置
    - 更快的渲染速度和更小的体积
- React的优势是：【适合大型、生态系统大】
    - 更适合大型应用
    - 同时适用于 Web 端和原生 App
    - 更大的生态系统，更多的支持和好用的工具


## Vuex 使用和原理
```
npm install vuex --save
```
```js
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
```

- 简介：它是全局状态管理容器，将状态抽离到全局，集中共享管理，有几个特点：单向数据流，响应式，非持久化。通过Vue结合实现store中数据的响应式。因为保存在内存中，所有不具有持久化，默认刷新就重置状态。可通过结合缓存的方法实现持久化。
![vuex](./img/vue-vuex.png)

- **场景：中大型单页应用，项目复杂时，多个视图展示需要读取同个状态或多个视图的行为需要变更同个状态**
    - 如插件中设备信息、运行数据、i18n、定时等状态信息。
- 使用
    - 在组件中获取Vuex的状态，在根实例注册 store 选项，将实例先注入所有子组件，再使用this.$store.xxx访问，最好放在computed中，可以响应式监听到变化。
      ```js
      import Vue from 'vue'
      import Vuex from 'vuex';
      Vue.use(Vuex);
      
      import store from '../store'
      
      const app = new Vue({
        el: '#app',
        // 把 store 对象提供给 “store” 选项，把 store 的实例注入所有的子组件
        store,
        ...
      })

      const Counter = {
        template: `<div>{{ count }}</div>`,
        computed: {
          count () {
            return this.$store.state.count
          }
        }
      }
      ```

      ```js
      //store.js

      export default new Vuex.Store({
        state: {
          count: 0
        },
        getters: {
          countPlus: state => {
            return state.count++;
          }
        },
        mutations: {
          increment (state, payload) {
            state.count++
          }
        },
        actions: {
          increment ({commit}) {
            commit('increment')
          }
        }
      })
      ```
    - 辅助函数：mapState、mapGetters、mapMutations、mapActions，使用需要先在根节点注入store实例，前面已提到过。
      - 使用`mapState、mapGetters`就不用一个个计算属性的写，然后用`...`展开运算符混入对应组件的computed中。
        ```js
        import { mapState, mapGetters } from 'vuex'

        export default {
          // ...
          computed: {
            // 局部组件自身计算值
            localComputed () { /* ... */ },

            // 使用对象展开运算符将 state 混入 computed 对象中
            ...mapState({
              // ...
            })
            // 也可传字符串数组，每个字符串表示与state同名
            ...mapState([
              // ...
            ])

            // 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
              'doneTodosCount',
              'anotherGetter',
              // ...
            ])
            // 使用 别名
            ...mapGetters({
              // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
              doneCount: 'doneTodosCount'
            })
          }
        }
        ```
      - 使用`mapMutations、mapActions`，将mutation和action的处理函数混入methods，就可以直接调用`this.incrementBy(amount)`和`this.incrementBy1(amount)`，自动对应映射为`this.$store.commit('incrementBy', amount)`和 `this.$store.dispatch('incrementBy1', amount)`
        ```js
        import { mapMutations, mapActions } from 'vuex'

        export default {
          // ...
          methods: {
            ...mapMutations([
              'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount) ` amount为载荷，可传参数
            ]),
            ...mapMutations({
              add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')` add为自定义别名。
            })

            ...mapActions([
              'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
            ]),
            ...mapActions({
              add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
            })
          }
        }
        ```
    - store.js示例
      ```js
      import Vuex from 'vuex';
      Vue.use(Vuex);
      export default new Vuex.Store({
          state: {
              deviceInfo: {},
              deviceDetail: {}
          },
          getters: {
              deviceName(state) {
                  return state.isInited ? state.deviceInfo.deviceName : '';
              },
              isPowerOn(state) {
                  return state.isInited && state.deviceDetail.power == 'on';
              }
          },
          mutations: {
              setDeviceInfo(state, payload) {
                  state.deviceInfo = payload;
              },
              setDeviceDetail(state, payload) {
                  state.deviceDetail = payload;
              }
          },
          actions: {
              // 查设备信息
              async updateDeviceInfo({ commit }) {
                  const response = await nativeService.getDeviceInfo().catch(err => nativeService.toast('设备信息获取失败'));
                  commit('setDeviceInfo', response.result);
                  return response;
              },
              // 查询lua状态
              async updateDeviceDetail({ commit }, { isShowLoading = true } = {}) {
                  const response = await nativeService
                      .sendLuaRequest(
                          {
                              operation: 'luaQuery',
                              params: {}
                          },
                          isShowLoading
                      )
                      .catch(err => nativeService.toast(err));
                  commit('setDeviceDetail', response.result);
                  return response;
              }
          }
      });
      ```
    - state：
      - 【状态中心】用于数据的存储，是store中的**唯一数据源**，
      - 【读取方式】`this.$store.state.A`
    - getters：
      - 【获取状态】用于数据的筛选和多个数据的相关性计算，**接受 state 作为其第一个参数**。基于state数据的二次包装，如vue中的computed属性。
      - 【属性读取方式】`this.$store.getters.B`，有缓存性；
      - 【方法读取方式】`this.$store.getters.fn(arg)`，可传参，无缓存性。
    - mutations：
      - 【同步更改状态】改变state的**唯一**途径，**接受 state 为第一个参数，Payload为第二个参数**，且不能处理异步事件，如果是两个异步回调的mutations，就不知道哪个先回调了。
      - 【调用1】通过commit调用handler处理函数`this.$store.commit('xxx', { A:'a' })`，commit第二个参数为载荷payload，作为参数传入处理函数xxx中，`xxx(state, payload){} `。
      - 【调用2】mapMutations辅助函数，将mutation的处理混入methods，就可直接使用`this.xxx()`，会自动转为`this.$store.commit('xxx')`
    - actions：
      - 【异步更改状态】如接口获取最新状态，获取之后再通过调用mutation来进而改变state，而不是直接变更state。接收一个上下文context作为参数，在里面使用context.commit方法，可以使用参数解构直接使用上下文的commit，`increment ({ commit }) { commit('increment') }`，更简洁。内部可以多个commit执行多个mutation。比如根据接口返回值，决定commit哪一个mutation。
      - 【调用1】`this.$store.dispatch('xxx')`
      - 【调用2】mapActions 辅助函数，将action的处理混入methods，就可直接使用`this.xxx()`，会自动转为`this.$store.dispatch('xxx')`
      - 示例：配合`async/await` 获取设备信息成功后，commit一个mutation(setDeviceInfo)，将返回结果存入state对象对应的属性中。
        ```js
        actions: {
          async updateDeviceInfo({ commit }) {
              const response = await nativeService.getDeviceInfo().catch(err => nativeService.toast('设备信息获取失败'));
              commit('setDeviceInfo', response.result);
              return response;
          },
        }
        ```
    - modules：
      -  将store 分割成模块（module）。每个模块拥有自己的 state、getter、mutation、action，便于维护。
      - 模块内部的 action、mutation 和 getter 是注册在全局命名空间的，这样使得多个模块能够对同一 mutation 或 action 作出响应。可通过添加`namespaced: true`这个属性表示带命名空间的模块。
      ```js
      const moduleA = {
        state: () => ({ ... }),
        mutations: { ... },
        actions: { ... },
        getters: { ... }
      }

      const moduleB = {
        state: () => ({ ... }),
        mutations: { ... },
        actions: { ... }
      }

      const store = new Vuex.Store({
        modules: {
          a: moduleA,
          b: moduleB
        }
      })

      store.state.a // -> moduleA 的状态
      store.state.b // -> moduleB 的状态
      ```
    - 大型应用结构参考，分割actions(异步逻辑封装)和mutations(同步更改状态)
      ```js
        ├── index.html
        ├── main.js
        ├── api
        │   └── ... # 抽取出API请求
        ├── components
        │   ├── App.vue
        │   └── ...
        └── store
            ├── index.js          # 我们组装模块并导出 store 的地方
            ├── actions.js        # 根级别的 action
            ├── mutations.js      # 根级别的 mutation
            └── modules
                ├── cart.js       # 购物车模块
                └── products.js   # 产品模块
      ```
    - vuex结合localStorage持久化数据
      - vuex里数据改变的时候把数据保存到localStorage里面
      - 刷新后，localStorage里如果有保存的数据，取出来替换store里的state。
      ```js
      let defaultCity = "上海"
      try {   // 用户关闭了本地存储功能，此时在外层加个try...catch
        if (!defaultCity){
          defaultCity = JSON.parse(window.localStorage.getItem('defaultCity'))
        }
      } catch(e) {

      }
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
    - weex中因为每个页面是独立入口，只能每个页面去引入注册store使用。

- 原理：核心就是与Vue本身结合，利用响应式机制，实现store的状态响应式。
  - 混入每个vm实例：`Vue.use(Vuex)`安装插件，内部调用Vuex插件提供的install方法。`Vue.mixin({ beforeCreate: vuexInit });` 先将vuexInit混入每个实例的beforeCreate钩子，vuexInit方法内部判断如果是根节点，则`options.store`赋值给 `this.$store`，否则从父节点的 `$store` 中获取。
    ```js

    /*使用时：将 store 放入 Vue 创建时的 option 中*/
    new Vue({
        el: '#app',
        store
    });
    // 下面是实现
    let Vue;
    export default install (_Vue) {
        Vue.mixin({ beforeCreate: vuexInit });
        Vue = _Vue;
    }
    function vuexInit () {
        const options = this.$options;
        if (options.store) {
            this.$store = options.store;
        } else {
            this.$store = options.parent.$store;
        }
    }
    ```
  - 数据响应式化：通过Vue核心进行依赖收集，修改时更新视图。
    ```js
    constructor () {
        this._vm = new Vue({
            data: {
                $$state: this.state
            }
        })
    }
    ```
  - 两个API：commit和dispatch
    -  commit 方法 用于触发  mutation 。从 ` _mutations` 中取出对应的 mutation，循环执行其中的每一个 mutation。
    ```js
    commit (type, payload, _options) {
        const entry = this._mutations[type];
        entry.forEach(function commitIterator (handler) {
            handler(payload);
        });
    }
    ```
    - dispatch 方法 用于触发 action，可以包含异步状态。取出  `_actions` 中的所有对应 action，将其执行，如果有多个则用  `Promise.all` 进行包装。
    ```js
    dispatch (type, payload) {
        const entry = this._actions[type];
        return entry.length > 1
        ? Promise.all(entry.map(handler => handler(payload)))
        : entry[0](payload);
    }
    ```


## keep-alive
- keep-alive 是 Vue 内置的一个组件，keep-alive可以实现组件缓存，当组件切换时不会对当前组件进行卸载，避免重新渲染 。
- 提供两个属性include/exclude：允许组件有条件的进行缓存。   
  - include 表示只有名称匹配的组件会被缓存，exclude 表示任何名称匹配的组件都不会被缓存 。
  - exclude 的优先级比 include 高；
- 对应两个生命周期activated/deactivated
  - 当组件被激活时，触发钩子函数 activated
  - 当组件被移除时，触发钩子函数 deactivated



## mixin混入
- 用来实现组件内容的复用，如埋点发送方法在多个页面都需要使用的，就可以作为mixin对象混入。
- 使用：对象混入可以包含任意组件选项Options，引入方式就是在mixins选项，放入数组中。
  - data在混入时进行递归合并，如果属性有冲突，以当前组件为主。
  - 生命周期钩子：
    - 同名钩子放在一起，混入的钩子要优先执行于组件自身的钩子
    - 如果多个对象混入，按mixins数组顺序执行。
    ```js
    const mixin1 = {
      created() {
        console.log('第一个打印')
      }
    }
    const mixin2 = {
      created() {
        console.log('第二个打印')
      }
    }
    export default {
      mixins: [mixin1, mixin2],
      created() {
        console.log('第三个打印')
      }
    }
    ```
  - 其他如methods/components/filter/props等，都是合并为同个对象，键名冲突，以组件自身键值为准。
- 全局混入：在所有组件内都生效，影响到每个Vue实例，包括第三方组件，需要慎用。
  ```js
  Vue.mixin({
    methods: {
      /*
      * 将埋点方法通过全局混入添加到每个组件内部
      * 也可以将埋点方法绑定到Vue的原型链上面，如： Vue.prototype.$point = () => {}
      */
      point(message) {
        console.log(message)
      }
    }
  })
  ```

## Vue3.0重要特性
相比于Vue2.x 主要有四方面的优势和特性：
  - 性能更好：采用proxy劫持对象 和 Diff算法优化
  - 体积更小：Tree-shaking
  - 逻辑清晰：组合式API Composition API 解决代码反复横跳的问题

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


#### Diff算法优化
- Diff算法优化【PatchFlags类型标志 + 模板传入的事件缓存起来cacheHandlers不会重复渲染】
  - 针对类型高效地diff：在创建VNode时就确定其类型，_createVNode传入数字表示是text(1)还是props(8)，无数字则表示静态，不需要diff。通过位运算来判断有多种类型组合VNode的类型，按位与(组合值)&(类型的值)就可以得出是由哪些类型组合而成的，针对那些类型进行diff即可。
  - 类型数值
  ```js
  export const enum PatchFlags {
  
    TEXT = 1,// 表示具有动态textContent的元素
    CLASS = 1 << 1,  // 表示有动态Class的元素
    STYLE = 1 << 2,  // 表示动态样式（静态如style="color: red"，也会提升至动态）
    PROPS = 1 << 3,  // 表示具有非类/样式动态道具的元素。
    FULL_PROPS = 1 << 4,  // 表示带有动态键的道具的元素，与上面三种相斥
    HYDRATE_EVENTS = 1 << 5,  // 表示带有事件监听器的元素
    STABLE_FRAGMENT = 1 << 6,   // 表示其子顺序不变的片段（没懂）。 
    KEYED_FRAGMENT = 1 << 7, // 表示带有键控或部分键控子元素的片段。
    UNKEYED_FRAGMENT = 1 << 8, // 表示带有无key绑定的片段
    NEED_PATCH = 1 << 9,   // 表示只需要非属性补丁的元素，例如ref或hooks
    DYNAMIC_SLOTS = 1 << 10,  // 表示具有动态插槽的元素
  }

  // 组合示例
  let TEXT = 1, STYLE = 4, PROPS = 8;
  1^8 = 9 // “异或”组合,存在text和props类型
  !!(9 & TEXT)  // true “按位与”检查是否有该类型
  !!(9 & PROPS) // true
  !!(9 & STYLE) // false
  ```

    - [蜗牛老湿](https://juejin.im/post/5e9faa8fe51d4546fe263eda)

#### Composition API
![组合式API-RFC](https://composition-api.vuejs.org/zh/#%E6%A6%82%E8%BF%B0)
- 使用示例：
  ```html
  <template>
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
  </template>

  <script>
    import { reactive, computed } from 'vue'

    export default {
      setup() {
        const state = reactive({ // 原data返回的对象实质也是通过这个方法变成响应式的，因为可以和options选项混用。
          count: 0,
          double: computed(() => state.count * 2),
        })

        function increment() {
          state.count++
        }

        return {
          state,
          increment,
        }
      },
    }
  </script>
  ```
- 组合式API
  - 简单理解：
    - 组合：将data、computed、method、生命周期等集中在setup()函数中，setup函数里可以存放多个组合函数，根据传递的参数可以清晰看到每个组合函数之间的依赖关系，通过逻辑关系组织代码，避免逻辑点分散开，通过return单一出口暴露的方式，把属性和方法给模板使用。
      ```js
      export default {
        setup() {
          // ...存放多个组合函数
          // 网络状态
          const { networkState } = useNetworkState()
          // 文件夹状态
          const { folders, currentFolderData } = useCurrentFolderData(networkState)
          const folderNavigation = useFolderNavigation({
            networkState,
            currentFolderData,
          })
          const createFolder = useCreateFolder(folderNavigation.openFolder)
        },
      }
      // 编写单个组合函数
      function useCreateFolder(openFolder) {// 参数是另一个方法
        // 原来的数据 property
        const showNewFolder = ref(false)
        const newFolderName = ref('')

        // 原来的计算属性
        const newFolderValid = computed(() => isValidMultiName(newFolderName.value))

        // 原来的一个方法
        async function createFolder() {
          // ...
          openFolder(result.data.folderCreate.path)
          newFolderName.value = ''
          showNewFolder.value = false
        }
        // 暴露出去
        return {
          showNewFolder,
          newFolderName,
          newFolderValid,
          createFolder,
        }
      }
      ```
    - 复用：同时让提取和复用变得简单，编写一个用组合式API的函数，暴露出去，在setup()直接引入该函数并解构获取属性/方法即可，不需要再创建组件实例mixin去混入，解决属性来源不清晰的问题，还可以通过解构消除mixin带来的命名空间冲突。
      - 一个组合函数
      ```js
      import { ref, onMounted, onUnmounted } from 'vue'

      export function useMousePosition() {
        const x = ref(0)
        const y = ref(0)

        function update(e) {
          x.value = e.pageX
          y.value = e.pageY
        }

        onMounted(() => {
          window.addEventListener('mousemove', update)
        })

        onUnmounted(() => {
          window.removeEventListener('mousemove', update)
        })

        return { x, y }
      }
      ```
      - 混入
        ```js
        import { useMousePosition } from './mouse'

        export default {
          setup() {
            const { x, y } = useMousePosition()
            // 其他逻辑...
            return { x, y }
          },
        }
        ```
  - 可与现有的 选项 Options API一起使用
    - 组合式 API 会在 2.x 的选项 (data、computed 和 methods) 之前解析，并且不能提前访问这些选项中定义的 property。
    - setup() 函数返回的 property 将会被暴露给 this
  - 灵活的逻辑组合与复用，混入(mixin) 将不再作为推荐使用
  - Composition API 的入口setup()
    - Vue创建组件实例，然后初始化 props ，紧接着就调用setup 函数，在 beforeCreate 钩子之前被调用。
    - this 在 setup() 中不可用，因为this和2.x的选项不同。
    - 使用方式
    ```js
    <template>
      <div>{{ count }} {{ object.foo }}</div>
    </template>

    <script>
      import { ref, reactive } from 'vue'

      export default {
        setup() {
          const count = ref(0)
          const object = reactive({ foo: 'bar' }) //在组件中从 data() 返回一个对象，内部实质上通过调用 reactive() 使其变为响应式。

          // 返回对象暴露给模板
          return {
            count,
            object,
          }
        },
      }
    </script>
    ```

  - 主要有六个API
    - reactive：将传入的对象变成响应式，是深度转换的
    - ref：用来初始化属性，返回一个响应式且可改变的ref对象，内部有唯一属性value，不过在模板不需要写value属性，会自动解开。`const showNewFolder = ref(false)`
    - computed：可传入get和set，返回ref对象
    - readonly：传入一个对象（响应式或普通）或 ref，返回一个原始对象的只读代理。深层的属性也是只读的。
    - watchEffect：传入的函数被立即执行，当更新时候再继续执行
    - watch：对比上面watchEffect，是懒执行的。只有监听到变化才执行回调函数。

  - 生命周期对应
    - beforeCreate -> 使用 setup()
    - created -> 使用 setup()
    - beforeMount -> onBeforeMount
    - mounted -> onMounted
    - beforeUpdate -> onBeforeUpdate
    - updated -> onUpdated
    - beforeDestroy -> onBeforeUnmount
    - destroyed -> onUnmounted
    - errorCaptured -> onErrorCaptured
  - 使用方式：
    ```js
    import { onMounted, onUpdated, onUnmounted } from 'vue'

    const MyComponent = {
      setup() {
        onMounted(() => {
          console.log('mounted!')
        })
        onUpdated(() => {
          console.log('updated!')
        })
        onUnmounted(() => {
          console.log('unmounted!')
        })
      },
    }
    ```
    注意：生命周期钩子注册函数只能在 setup() 期间同步使用， 因为它们依赖于内部的全局状态来定位当前组件实例（正在调用 setup() 的组件实例）, 不在当前组件下调用这些函数会抛出一个错误。
    - 逻辑提取与复用

#### Tree-shaking
编译时用import按需引入，没有使用就不会打包，配合webpack的Tree-shaking，实现更小的体积10-20kb

## Vue响应式对比

### Vue 2.x 响应式原理简述
- Vue在初始化数据时，会使用Object.defineProperty重新定义data中的所有属性，当开始渲染时，首先会进行依赖收集(收集当前组件的watcher)，如果属性发生变化会通知相关依赖进行更新操作(发布订阅)。

### Vue 3.x 响应式原理
- Vue3.x改用Proxy替代Object.defineProperty。因为Proxy可以直接监听对象和数组的变化，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。
- 原生Proxy只会代理对象的第一层，Vue3.0为了实现了深度观测reactive实现深度响应式化对象属性，判断当前Reflect.get的返回值是否为Object，如果是则再通过reactive方法继续做代理。
- 监测数组的时候可能触发多次get/set，为了防止触发多次，判断key是否为当前被代理对象target自身属性，也可以判断旧值与新值是否相等，只有满足以上两个条件之一时，才有可能执行trigger。

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

## weex架构
- 早期混合开发：
  - 使用客户端内置浏览器也就是webview，前端开发的是H5页面。
  - 优点：提高开发效率，满足跨平台需求
  - 缺点：性能较差
- weex
  - 阿里和vue合作的性能更好的跨端解决方案，利用 JS 引擎实现了**跨平台能力**，同时又将JS 控件，对应解析为原生控件进行渲染，实现了**性能的提升**。
  - 流程：
    - vue代码打包成JS文件，APP请求服务器拉取这些JS文件，然后进入APP处理
    - APP: 四个重要组成部分 JS runtime、JS bridge、native render、weex core
      - `JS runtime`: 执行JS代码，iOS使用JS Core，安卓上使用V8
      - `weex core`: weex的核心代码，负责JS解析工作，构建虚拟DOM，根据diff将修改patch到视图上。
      - `JS bridge`: 翻译成原生native可执行的代码
      - `native render`:负责视图渲染，渲染器收到指令后，渲染为原生组件，我们写的`<div><p>`等标签，对应变成客户端的原生组件，展示给用户。
  - 优点：跨平台，体验流畅
  - 缺点：框架和平台耦合过多，版本兼容维护比较困难。性能有瓶颈，因为JS bridge也存在性能限制。
  - 架构图
  ![frame-weex](./img/frame-weex.jpg)


## 其他
### v-bind

```html
<!-- 绑定一个 attribute -->
<img v-bind:src="imageSrc">
<!-- 缩写 -->
<img :src="imageSrc">

<!-- 绑定一个全是 attribute 的对象 -->
<!-- 字段的props透传至element-ui用到此方法 -->
<el-button v-bind="{ type: 'danger', size: 'mini' }"></el-button>
<!-- 等同于 -->
<el-button type='danger' size='mini'>主要按钮</el-button>
```