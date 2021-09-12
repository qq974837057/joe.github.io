## webpack

### 构建流程 ✨

- 1、初始化参数：拷贝配置文件 webpack.config.js 合并参数，并实例化插件，得到最终 options 对象。
- 2、开始编译：初始化 Compiler 编译对象，传入各插件的 apply 方法，为事件挂载对应的回调，**执行 Compiler 的 run 方法开始编译**，以下是一些关键事件点。

```js
function webpack(options) {
  var compiler = new Compiler();
  ...// 检查options,若watch字段为true,则开启watch线程
  return compiler;
}
...
```

- 3、确定入口：根据 entry 找到入口文件
- 4、编译模块：用 **loader 进行转换**后，找出对应依赖模块
- 5、完成编译：确定了转换好的内容和依赖关系
- 6、输出准备：根据入口和模块 module 的依赖关系，组装成包含多个 module 的 chunk，每个 chunk 转成一个文件并生成 hash，加载到 bundle 输出列表【代码优化和功能添加的关键环节】。
- 7、执行输出：根据 output 路径和文件名，写入文件系统。
- 【事件钩子】执行 run 开始编译：过程中触发一些钩子 beforeRun->run->beforeCompile->compile（开始编译）->make（入口分析依赖）->seal（构建封装，不可更改）->afterCompile（完成构建，缓存数据）->emit （输出 dist 目录），每个节点会触发对应的 webpack 事件，**plugin 插件监听事件**进行对应的处理。
- 【监听事件】编写插件 plugin 的时候，在 apply 中执行`compilation.plugin('xxx', callback)`绑定对应的监听事件，监听到就会执行特定的逻辑
- 【获取构建文件】`compiler.hooks.emit.tap('xxx',(compilation)=>{})` 这个钩子可以获取到 emit 阶段的 compilation 对象，compilation.assets 有所有构建好的资源文件，可以方便我们处理

### webpack.config.js 配置

- 配置合并：
  - 在加载插件之前，webpack 将 webpack.config.js 中的各个配置项拷贝到 options 对象中。
  - options 作为最后返回结果，包含了之后构建阶段所需的重要信息。
  ```js
  {
      entry: {},//入口配置
      output: {}, //输出配置
      plugins: [], //插件集合(配置文件 + shell指令)
      module: { loaders: [ [Object] ] }, //模块配置
      context: //工程路径
      ...
  }
  ```

```js
var path = require("path");
var node_modules = path.resolve(__dirname, "node_modules");
var pathToReact = path.resolve(node_modules, "react/dist/react.min.js");

module.exports = {
  // 入口文件，是模块构建的起点，同时每一个入口文件对应最后生成的一个 chunk。
  entry: {
    bundle: [
      "webpack/hot/dev-server",
      "webpack-dev-server/client?http://localhost:8080",
      path.resolve(__dirname, "app/app.js"),
    ],
  },
  // 文件路径指向(可加快打包过程)。
  resolve: {
    alias: {
      react: pathToReact,
    },
  },
  // 生成文件，是模块构建的终点，包括输出文件与输出路径。
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },
  // 这里配置了处理各模块的 loader ，包括 css 预处理 loader ，es6 编译 loader，图片处理 loader。
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel",
        query: {
          presets: ["es2015", "react"],
        },
      },
    ],
    noParse: [pathToReact],
  },
  // webpack 各插件对象，在 webpack 的事件流中执行对应的方法。
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
```

### bundle，chunk，module 分别指什么

- Entry：作为构建依赖图的入口文件
- Output：输出创建的 bundle 到指定文件夹
- bundle（包）：webpack 打包出来的文件
- chunk（代码块）：代码分割的产物（如 webpack4 的 SplitChunksPlugin），也就是按需加载的分块。将一些代码单独打包为一个 Chunk ，由多个模块 module 组合而成，用于按需加载或缓存。
- module（模块）：Webpack 里一切皆模块（图片、ES6 模块）、一个模块对应一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- module 和 chunk 的图解
  ![module和chunk](./img/webpack-chunk.jpg)

### Loader 和 Plugin 的区别 ✨

- Loader(加载器)
  - 用于文件转换，单一原则，每个 Loader 只做一种"转义"工作。webpack 链式调用每个 loader，从后往前，可以理解为出栈过程。
  - webpack 原生只能解析 js，loader 使 webpack 可以加载和解析非 js 文件(css、图片)
  - 用法：module.rules 配置，数组里面每项都是 object，描述了{ test 针对类型、loader 使用什么加载、options 配置的参数 }
    ```js
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader",
          options: vueLoaderConfig,
        },
        {
          test: /\.scss$/,
          loaders: ["style-loader", "css-loader", "sass-loader"],
        },
      ];
    }
    ```
- 常见 Loader
  - file-loader：加载文件资源
  - url-loader：小文件以 base64 的方式把文件内容注入到代码中去
  - css-loader：加载 CSS，支持模块化、压缩、文件导入等特性
  - style-loader：把外部 CSS 代码注入到 html 的 head 标签中。
  - sass-loader: sass 语法转换
  - node-sass: sass-loader 依赖需要
  - babel-loader:把 ES6+ 转换成 ES5
  - eslint-loader： ESLint 检查 JavaScript 代码
- 自己实现一个 loader

  - 导出一个函数，这个函数接收 content 匹配到的文件内容，对这些传入的字符串进行处理，然后返回，在 webpack.config.js 的 module.rules 数组里加上一个对象，描述匹配的文件和导入 js 文件和写 options 配置。
  - 获取 options 配置：loader-utils 库`loaderUtils.getOptions(this)`
  - 返回形式推荐写法：`this.callback(null, "{};" + content)`两个参数，error + 编译完的 content。
  - 异步 loader：使用 async/await

- Plugin(插件)
  - 用于扩展 webpack 的功能（如代码分割、压缩、定义变量、替换静态资源引用路径）
  - 构建过程调用原理：Webpack 会在构建过程中对应的钩子中广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的输出结果
  - 钩子：beforeRun -> run -> beforeCompile -> compile（开始编译）-> make（入口分析依赖）-> seal（构建封装，不可更改）-> afterCompile（完成构建，缓存数据）-> emit （发射 stream，输出 dist 目录）
  - 用法：plugins 中单独配置，数组里每项都是一个 plugin 实例，参数由构造函数传入。
    ```js
    plugins: [
      new HtmlWebpackPlugin(),
      new ProgressBarPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new VueLoaderPlugin(),
    ];
    ```
- 常见 Plugin

  - TerserWebpackPlugin：webpack4 默认的代码压缩插件，默认开启多进程和缓存
  - split-chunks-plugin: 代码分割 （Webpack 4 满足条件会自动拆分 chunk，如默认大于 30kb 的文件、可复用...）
  - define-plugin：定义环境变量（开发环境和生产环境的域名或 API，或全局版本号：通过日期时间计算拼接，代码中直接使用）

  ```js
  new webpack.DefinePlugin({
    WEIGHT_VERSION: JSON.stringify(getPluginVersion()),
  });
  ```

  - banner-plugin: 给每个 chunk 头部添加 banner，如注释

  ```js
  new webpack.BannerPlugin({
      banner: '// { "framework": "Vue" }\n',
      raw: true // banner内容直出，不以注释出现
  }),
  ```

  - html-webpack-plugin：生成 html 文件，里面添加了 JS 文件的 script 标签，还可以设置 loading
  - webpack-bundle-analyzer: 可视化 webpack 输出文件的体积
  - uglifyjs-webpack-plugin：通过 UglifyES 压缩 ES6 代码

  ```js
  const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

  module.exports = {
    plugins: [
      new UglifyJsPlugin({
        cache: true, //缓存
        sourceMap: false, //压缩
        parallel: 4, //多核
      }),
    ],
  };
  ```

  - webpack-parallel-uglify-plugin: 多核压缩,提高压缩速度

- 自己实现一个 plugin
  - 写一个带 apply(compiler) 方法的 class 类，暴露出去，可以给外部新建 plugin 实例
  - 事件流开始的时候，实例化所有插件，执行插件的 apply 方法，在事件流上挂载回调的方法
  - 构建过程中钩子广播出事件，然后执行对应回调，改变输出结果

### HMR 热更新原理（hot module replacement）✨

> 当你对代码进行修改并保存后，webpack 将对代码重新打包，并将新的模块发送到浏览器端，浏览器通过新的模块替换老的模块，这样在不刷新浏览器的前提下就能够对应用进行更新。

- 在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，对修改的模块重新编译打包。
- webpack-dev-middleware 处理打包后的文件存在内存里。
- webpack-dev-server 和 webpack-dev-server/client（浏览器端）建立 websocket 长连接，利用这个连接，传递修改模块的 hash 和编译打包的状态信息给浏览器。
- HMR.runtime 收到新模块的 hash(非最新)，Jsonp.runtime 向 webpack-dev-server 服务端发送 ajax 请求，获取模块更新列表的 manifest 描述文件（包含更新模块的最新 hash）再通过 Jsonp 获取最新 hash 对应的模块代码。
- HotModulePlugin 进行模块对比，替换模块及更新依赖树 modules tree 引用。
- HMR 失败，通过浏览器刷新整个页面获取最新代码。
  ![webpack-hmr](./img/webpack-hmr.png)

- 疑问：为什么不在 socket 发送更新好的模块代码
  - 应该是为了功能解耦
  - dev-server/client 只负责消息传递、不负责新模块的获取
  - HMR runtime 才应该是获取新代码的地方。

### webpack 打包体积优化(Tree-shaking)

- 分析打包后的模块文件大小
  - webpack-bundle-analyzer
  ```
  npm i -D webpack-bundle-analyzer
  npm run build -- --report
  ```
- Tree-shaking

  - webpack4 默认开启 Tree-shaking（mode 为 production）：清除代码中无用的部分。

  ```js
  //index.js
  import { add, minus } from "./math";
  add(2, 3); //minus不会参与构建
  ```

  - 原理
    - 基于 ES6 modules 的静态检测也就是 import 语法（确保引用的模块都是 ES6 规范）
    - ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用。
    - 其他模块方式是动态的，很难预测，如：CommonJS 模块是运行时加载，ES6 模块是编译时输出接口，CommonJs 是动态语法可以写在判断里，ES6 Module 静态语法只能写在顶层。
  - 实现：先标记模块导出值哪些没被使用，使用 Terser 删掉这些没用的语句。

    - Make 阶段，收集模块导出变量并记录到模块依赖关系图 ModuleGraph 变量中
    - Seal 阶段，遍历 ModuleGraph 标记模块导出变量有没有被使用
    - 生成产物时，若变量没有被其它模块使用则删除对应的导出语句

  - 避免无意义的赋值
    - 也就是导入值赋值之后给一个变量后，没有使用
    - 而静态分析只是看代码中有没有出现这个变量和有没有被其他模块引用
    - 从而导致没有 Tree Shaking 。
  - 导出值的粒度控制

    - 只用到`export default {}` 导出值的其中一个属性，整个 default 对象依然会被完整保留。
    - 优化：保持原子性

      ```js
      const bar = "bar";
      const foo = "foo";

      export { bar, foo };
      ```

  - 防止 Tree Shaking 失效

    - 禁止 Babel 转译模块导入导出语句：modules: false， webpack 2.0 开始原生支持 ES Module，也就是说不需要 babel 把 ES Module 转换成曾经的 commonjs 模块
    - 失效原因：**使用 babel-loader，将 es6 模块转成 commonjs 了，无法检测**
    - 解决：.babelrc 或 webpack.config.js 里设置 `modules: false` ，避免 module 被转换 commonjs

      ```js
      // .babelrc
      {
        "presets": [
          ["@babel/preset-env",
            {
              "modules": false
            }
          ]
        ]
      }
      // 或者
      // webpack.config.js
      module: {
          rules: [
              {
                  test: /\.js$/,
                  use: {
                      loader: 'babel-loader',
                      options: {
                          presets: ['@babel/preset-env', { modules: false }]
                      }
                  }，
                  exclude: /(node_modules)/
              }
          ]
      }

      ```

  - sideEffects: false
    - webpack 4 在 package.json 文件中设置 sideEffects: false 表示模块是无副作用的（是否修改了 window 上的属性，是否复写了原生对象方法等），可以放心进行判断删除。
    - 我这个包在设计的时候就是期望没有副作用的，即使他打完包后是有副作用的，webpack 同学你摇树时放心的当成无副作用包摇就好啦！
    - 使用：
      ```js
      // 第三方npm模块 的 package.json
      {
          "name": "your-project",
          "sideEffects": false
      }
      // 业务代码的 webpack.prod.conf.js
      module.exports = {
          module: {
              rules: [
                  {
                      test: /\.jsx?$/,
                      exclude: /(node_modules|bower_components)/,
                      use: {
                          loader: 'babel-loader',
                      },
                      sideEffects: false || []
                  }
              ]
          },
      }
      ```

### webpack 打包加速优化(缓存 + 多核 + 抽离) ✨

- 提高热更新速度：
  - 提高热更新速度，上百页 2000ms 内搞定，10 几页面区别不大
  ```js
  //在.env.development环境变量配置
  VUE_CLI_BABEL_TRANSPILE_MODULES: true;
  ```
  - 原理：利用插件，在开发环境中将异步组件变为同步引入，也就是 import()转化为 require())
  - 一般页面到达几十上百，热更新慢的情况下需要用到。
  - webpack5 即将发布，大幅提高了打包和编译速度
- 分析打包时长：

  - 速度分析插件[speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin)

  ```
  npm install --save-dev speed-measure-webpack-plugin
  ```

  ```js
  //vue.config.js
  //导入速度分析插件
  const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  //实例化插件
  const smp = new SpeedMeasurePlugin();

  module.exports = {
    configureWebpack: smp.wrap({
      plugins: [
        // 这里是自己项目里需要使用到的其他插件
        new yourOtherPlugin(),
      ],
    }),
  };
  ```

- 较耗时：代码的编译或压缩（转化 AST 树 -> 遍历 AST 树 -> 转回 JS 代码）
  - 编译 JS、CSS 的 Loader
  - 压缩 JS、CSS 的 Plugin
- 缓存：让二次构建时，不需要再去做重复的工作[没有变化的直接使用缓存，速度更快]
  - 开启 Loader、压缩插件的 cache 配置【如 babel-loader 的`cacheDirectory:true`】，uglifyjs-webpack-plugin【如`cache: true`】，构建完将缓存存放在`node_modules/.cache/..`。
  - [cache-loader](https://www.npmjs.com/package/cache-loader)：将 loader 的编译结果写入硬盘缓存，再次构建如果文件没有发生变化则会直接拉取缓存,添加在时间长的 loader 的最前面。
  ```js
  module: {
      rules: [
          {
              test: /\.ext$/,
              use: ['cache-loader', ...loaders],
              include: path.resolve('src'),
          },
      ],
  }
  ```
- 多核：充分利用了硬件本身的优势

  - happypack：

    - 原理：将 Loader 转换分解到多个子进程中去并行处理，子进程处理完成后把结果发送到主进程中，从而减少总的构建时间
    - 使用方法：开启系统 CPU 最大线程，通过插件将 loader 包装，暴露 id，直接 module.rules 引用该 id。
    - happypack 默认开启 CPU 核数 - 1 个进程，当然，我们也可以传递 threads 给 happypack。

    ```js
    //安装：npm install happypack -D
    //引入：const Happypack = require('happypack');
    exports.plugins = [
      new Happypack({
        id: "jsx",
        threads: 4,
        loaders: ["babel-loader"],
      }),

      new Happypack({
        id: "styles",
        threads: 2,
        loaders: ["style-loader", "css-loader", "less-loader"],
      }),
    ];

    exports.module.rules = [
      {
        test: /\.js$/,
        use: "Happypack/loader?id=jsx",
      },

      {
        test: /\.less$/,
        use: "Happypack/loader?id=styles",
      },
    ];
    ```

  - thread-loader：添加在此 loader 后面的放入单独的 worker 池里运行，配置简单
    ```js
    //安装：npm install thread-loader -D
    module.exports = {
      module: {
        //我的项目中,babel-loader耗时比较长，所以我给它配置 thread-loader
        rules: [
          {
            test: /\.jsx?$/,
            use: ["thread-loader", "cache-loader", "babel-loader"],
          },
        ],
      },
    };
    ```
  - 多进程压缩
    - 默认的 TerserWebpackPlugin（比 uglifyjs 性能更好）：默认开启了多进程和缓存，缓存文件 `node_modules/.cache/terser-webpack-plugin`
    - 其他并行压缩插件：
      - webpack-parallel-uglify-plugin:子进程并发执行把结果送回主进程，多核并行压缩来提升代码压缩速度
      - uglifyjs-webpack-plugin 自带的 parallel：【如`parallel: true`】配置项开启多核编译

- 抽离：

  - dll：内置 webpack 的 DllPlugin 编译 和 DllReferencePlugin 引入 dll，提高打包速度

    - Vue 全家桶、element-ui、echarts、工具库 lodash 不常变更的依赖 【几十秒】，避免每次构建都进行打包
    - 通过 DllPlugin 来对那些我们引用但是不会经常修改的 npm 包来进行预编译，
    - 再通过 DllReferencePlugin 将预编译的模块加载进来,避免反复编译浪费时间，提高打包速度。
    - 步骤：

      - 新建一个 webpack.dll.config.js 的配置文件(与 webpack 配置同级)，配置 DllPlugin 插件和打包的库和输出文件的位置
      - package.json 添加 dll 命令，执行 webpack.dll.config.js 文件
      - npm run dll 命令，生成第三方代码集合 js 文件
      - webpack.config.js 里配置 DllReferencePlugin 插件、找到 manifest.json 文件映射到依赖并打包引入
      - 修改 index.html，加入 script 标签，写上对应 dll 路径
      - 如果更新依赖包，执行`npm run dll`,新的 dll 文件名便会加上新的 hash

      ```js
      // webpack.config.dll.js
      const webpack = require('webpack');
      const path = require('path');

      module.exports = {
          entry: {
              react: ['react', 'react-dom']
          },
          mode: 'production',
          output: {
              filename: '[name].dll.[hash:6].js',
              path: path.resolve(__dirname, 'dist', 'dll'),
              library: '[name]_dll' //暴露给外部使用
              //libraryTarget 指定如何暴露内容，缺省时就是 var
          },
          plugins: [
              new webpack.DllPlugin({
                  //name和library一致
                  name: '[name]_dll',
                  path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json') //manifest.json的生成路径
              })
          ]
      }

      // package.json 中新增 dll 命令
      {
          "scripts": {
              "build:dll": "webpack --config webpack.config.dll.js"
          },
      }

      // npm run build:dll 后，会生成
      dist
          └── dll
              ├── manifest.json
              └── react.dll.9dcd9d.js

      // manifest.json 用于让 DLLReferencePlugin 映射到相关依赖上。至此 dll 准备工作完成，接下来在 webpack 中引用即可。

      // webpack.config.js
      const webpack = require('webpack');
      const path = require('path');
      module.exports = {
          //...
          devServer: {
              contentBase: path.resolve(__dirname, 'dist')
          },
          plugins: [
              new webpack.DllReferencePlugin({
                  manifest: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')
              }),
              new CleanWebpackPlugin({
                  cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录
              }),
              //...
          ]
      }
      // 修改 public/index.html 文件，在其中引入 react.dll.js
      <script src="/dll/react.dll.9dcd9d.js"></script>
      // 使用 npm run build 构建，可以看到 bundle.js 的体积大大减少，提高打包速度。
      ```

  - 配置 Externals（推荐）：外部引入，将不需要打包的库或静态资源从构建逻辑中剔除，使用 **CDN** 的方式去引用。
    - 步骤：在 externals 中配置 key[包名]+value[CDN 全局变量名]，然后在 HTML 中引入 CDN 的 script 标签。就能实现 import 引入了。
    ```js
    // index.html
    <script
      src="https://code.jquery.com/jquery-3.1.0.js"
      integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
      crossorigin="anonymous"
    ></script>;
    //webpack.config.js
    module.exports = {
      //...
      externals: {
        //jquery通过script引入之后，全局中即有了 jQuery 变量
        jquery: "jQuery",
      },
    };
    ```
    - 常见 CDN 链接由 host 域名+包名+版本号+路径
    ```js
    <script src="https://cdn.bootcss.com/react/16.9.0/umd/react.production.min.js"></script>
    ```
    - 有些 CDN 服务不稳定，尽量选择成熟的 CDN 服务。

- Vue 关闭在 vue.config.js： `module.exports= { productionSourceMap:false （表示生产环境进行代码压缩） }`
  - 优点：构建速度快，体积变小，不需要源码 map 文件，进行代码压缩加密
  - 缺点：运行时有错误，无法准确定位哪一行。
- 更直接：
  - 升级机器配置
  - 升级 webpack5 或 node 版本
- 效果提升：(20 页)
  - 初次打包：20s
  - 二次打包：8s

### webpack 在 vue cli3 的使用

- 默认 splitChunks 和 minimize

  - 代码就会自动分割、压缩、优化，
  - 可结合 import 和魔术注释实现代码分割，通过配置对分离出的 chunk 命名

    ```js
    // index.js
    import (
    /* webpackChunkName: “my-chunk-name” */
    './footer'
    )

    // webpack.config.js
    {
    output: {
        filename: “bundle.js”,
        chunkFilename: “[name].lazy-chunk.js”
    }
    }
    ```

  - 可单独拆包配置，如 elementUI
  - 同时 webpack 也会自动帮你 Scope hoisting（变量提升） 和 Tree-shaking

  ```js
  splitChunks: {
  // ...
      cacheGroups: {
          elementUI: {
              name: "chunk-elementUI", // 单独将 elementUI 拆包
              priority: 15, // 权重需大于其它缓存组
              test: /[\/]node_modules[\/]element-ui[\/]/
          }
      }
  }
  ```

- 默认 CSS 压缩：mini-css-extract-plugin

  - 升级：将原先内联写在每一个 js chunk bundle 的 css，单独拆成了一个个 css 文件。
  - css 独立拆包最大的好处就是 js 和 css 的改动，不会影响对方，导致缓存失效。
  - 配合 optimization.splitChunks 去拆开打包独立的 css 文件

- 合并配置：配置 configureWebpack 选项，可为对象或函数(基于环境有条件地配置), 合并入最终的 webpack 配置
  ```js
  // vue.config.js
  module.exports = {
    configureWebpack: {
      plugins: [new MyAwesomeWebpackPlugin()],
    },
  };
  // vue.config.js
  module.exports = {
    configureWebpack: (config) => {
      if (process.env.NODE_ENV === "production") {
        // 为生产环境修改配置...
      } else {
        // 为开发环境修改配置...
      }
    },
  };
  ```
- 链式操作：修改/新增/替换 Loader，更细粒度的控制其内部配置
  ```js
  // vue.config.js
  module.exports = {
    chainWebpack: (config) => {
      config.module
        .rule("vue")
        .use("vue-loader")
        .loader("vue-loader")
        .tap((options) => {
          // 修改它的选项...
          return options;
        });
    },
  };
  ```

### 参考阅读

- [Webpack 4 和单页应用入门](https://github.com/wallstreetcn/webpack-and-spa-guide)

## babel 原理

- 它的功能：是个编译器，将源代码字符串传入，返回一段新的代码字符串，即不运行代码，也不组合打包代码，比如输入 ES6+的代码，编译为 ES5。
- 示例是一个简单的声明赋值语句，经过 AST 转化后各部分内容的含义就更为清晰明了
  ![webpack-babel](./img/webpack-babel.png)
- 有三个步骤：
  - 第一步解析：将代码字符串解析成 AST 抽象语法树，字符串变为对象结构【细分为：分词 + 语义分析】
  - 第二步变换：遍历 AST 抽象语法树进行修改，变换成另一个 AST 树【.babelrc 里配置的 presets 和 plugins 在此处工作】
  - 第三步再建：遍历变换后的 AST 抽象语法树再生成代码字符串

```js
// webpack.base.conf.js
module.exports = {
    module: {
        rules: [
        {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
        },
        ]
    }
}

// .babelrc配置文件
{
  "presets": ["es2015", "stage-0"],           // 一组插件集合
  "plugins": ["transform-object-rest-spread", // 单独的每个插件
    [
      "transform-runtime", // 对于ES6+新特性，会自动引用模块babel-runtime中的polyfill(helper)
      {
        "helpers": false,
        "polyfill": false, //是否切换（Promise，Set，Map等）为使用非全局污染的 polyfill。
        "regenerator": true,
        "moduleName": "babel-runtime" //引入 helper要使用的模块的名称/路径
      }
    ]]
}
```

## 前端工程化

- 模块化
  - JS 模块化
  - CSS 模块化
  - 资源模块化
- 组件化
  - 复杂页面按功能拆分成多个独立的组件
  - 通用组件
  - 业务组件
- 规范化
  - UI 规范
  - 接口规范
  - 编码规范(eslint)
  - 提交规范(commitizen 工具 + cz-conventional-changelog 规范适配器)
  - 开发流程(四大阶段、GitFlow 工作流、CodeReview、测试、部署)
