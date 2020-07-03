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

