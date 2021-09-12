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

## CI/CD

### CI/CD 三部分

1. 持续集成 就是把多个码农写的代码集成到同一个分支，然后经过编译、测试、打包之后将程序保存到仓库中。
2. 持续交付 就是定时地、自动地从仓库中将最新的程序部署到测试环境里。
3. 持续部署 就是定时地、自动地将过去一个稳定的发布版本部署到生产环境里。

谁才是世界上最好的 CI/CD 工具？TeamCity、Jenkins、Travis CI、AppVeyor 或是 Azure Pipelines ？我的答案是“和开发流程不割裂的工具才是最好的工具”，在我们公司内部常用的代码托管平台是 Gitlab，同时其也向用户提供了 CI/CD 的集成工具，这样的话就为我们去定制一些前端的 CI/CD 流程提供了更多的想象空间。

### 持续集成

- 非持续集成（“简单”集成）
  ![](./img/build-ci-1.png)

- 持续集成
  ![](./img/build-ci-2.png)

- 合并和测试并不是在一个单一的有压力的集成时刻进行，集成一直在连续的时刻发生。

- 持续集成是开发软件的一种更好的方法（相比于“简单”集成），因为它：

  - 减少在合并 feature 时出现的意外次数
  - 解决“在我的机子上没问题”的问题
  - 将测试周期切片到每个 feature 逐渐合并到主线中的阶段（而不是一次性的）
  - 其结果就是，一个使用 CI 的团队不是生活在过山车上 (在开发时期很平静，伴随着的是有压力的 release)，而是可以在如何接近完成项目的渐进方式中得到更好的可见性。

### 持续交付（Delivery）

- 持续交付是尽可能频繁地组装和准备软件（就像它会被发布到生产那样）的实践。
- CD，让 CI 走得更远一步。在每个 feature 合并到主线中，软件不仅要测试正确性，而且也要包装和部署到测试环境（比较理想地符合生产环境）。所有这一切都是以完全自动化的方式。
  ![](./img/build-ci-3.png)

### 持续部署（Deployment）

- CD 的 D 也可以表示部署，在持续交付的基础上，取消所有人工干预，发现准备好的 release candidate（候选版本）直接推送到生产。

- 正常来走 CI/CD，需要保证每个基础是稳固的，先 CI 再 CD。
  ![](./img/build-ci-4.png)

  ![](./img/build-ci-5.png)
