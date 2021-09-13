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

## 项目开发流程

总的来说有四个阶段：需求阶段、开发阶段、测试阶段、发布阶段。正常是一个月一个版本迭代。

- 需求阶段：需求设计，业务方评审，产品组评审，产品/技术正式评审，UI 评审，接口评审，测试用例评审
- 开发阶段：任务拆分，迭代计划，前后端开发，开发联调，增量交付测试
- 测试阶段：全面提测，测试环境测试，技术修复 Bug，UI 验收，集成测试
- 发布阶段：预发布，灰度发布，正式发布，迭代复盘
  ![](./img/development-process-1.png)

## 提交规范(git cz)

- [掘金参考](https://juejin.im/post/5afc5242f265da0b7f44bee4#heading-4)

> commitizen 可使用 git cz + cz-conventional-changelog 规范适配器 + commitlint 校验 + husky

- 作用：生成规范统一的 commit message，有助于团队成员 review 和项目管理。

- 最终提交格式：

```
<type>(<scope>): <subject> // 类型 范围 标题

<body> // 内容
```

![git-commit](./img/git-commit.png)
![git-cz](./img/git-cz.png)

> 注意：windows 下 git bash 无法使用交互式，可直接在 vscode 中使用终端配置 git bash，方可使用上下箭头移动交互。

- 安装：

  - 全局安装：需要 ~/.czrc 配置文件, 为 commitizen 指定 Adapter.

  ```
  npm install -g commitizen cz-conventional-changelog
  // 创建配置文件
  echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
  ```

  - 项目级安装

  ```
  npm install -D commitizen cz-conventional-changelog

  // package.json
  "script": {
      ...,
      "commit": "git-cz",
  },
   "config": {
      "commitizen": {
        "path": "node_modules/cz-conventional-changelog"
      }
   }
  ```

  - 安装 commitlint 校验规范： @commitlint/config-conventional (符合 Angular 团队规范) + husky(git hook 钩子) 在 commit 提交后进行 lint 校验.

  ```
  npm i -D @commitlint/config-conventional @commitlint/cli husky

  // 创建配置文件.commitlintrc.js，与package.json同级
  module.exports = {
    extends: [
      "@commitlint/config-conventional"
    ],
    rules: {
    }
  };

  // package.json
  "husky": {
      "hooks": {
        "commit-msg": "commitlint -e $GIT_PARAMS"
      }
  }
  ```

- 使用：

  ```

  命令：npm run commit or git cz(全局安装下可使用)

  1.Select the type of change that you're committing 选择改动类型 (<type>)

  2.What is the scope of this change (e.g. component or file name)? 填写改动范围 (<scope>)

  3.Write a short, imperative tense description of the change: 写一个精简的描述 (<subject>)

  4.Provide a longer description of the change: (press enter to skip) 对于改动写一段长描述 (<body>)

  5.Are there any breaking changes? (y/n) 是破坏性修改吗？默认n (<footer>)

  6.Does this change affect any openreve issues? (y/n) 改动修复了哪个问题？默认n (<footer>)

  // 生成的最终格式
  <type>(<scope>): <subject>
  <BLANK LINE>
  <body>
  <BLANK LINE>
  <footer>

  // 填写完毕后，husky会调用commitlint对message进行格式校验，默认规定type及subject为必填项。
  ```

- type 必填：当一次改动包括主要 type 与特殊 type 时，统一采用主要 type。
  ```
      # 主要
      feat：新功能
      fix： 修复bug
      # 特殊
      docs: 文档相关
      style： 代码格式：缩进、空格之类
      build： webpack构建工具或外部依赖变动如npm
      refactor：重构
      revert：执行git revert打印的message
  ```
- scope 必填：改动的范围，格式为项目名/模块名
  ```
  node-pc/common rrd-h5/activity
  ```
- subject: commit 的概述
- body：commit 的具体改动情况和原因
- break changes：破坏性修改：描述接口删除、迁移等
- affect issues: 影响的哪个 issues`（re #123、fix #123）`

## 代码规范(eslint)

- 常用规则：`eslint:recommended`
- 作用：统一代码风格，避免低级错误。常见规则如：分号，引号，禁止 console，禁止条件判断出现常量，禁止 return，break 后面出现不可到达代码等。
- 安装在开发环境

```
npm install eslint --save-dev
```

- 创建.eslintrc 文件（在根目录）

```
eslint --init
```

```js
// .eslintrc.js
module.exports = {
  // 指定解析器
  parse: "",
  // 指定脚本的运行环境
  env: {
    node: true,
    es6: true,
  },
  // 扩展引入规则
  extends: [
    // 同时对 .vue 文件中的 js 代码进行检测，就需要利用 eslint-plugin-vue 插件来搭配使用。
    "plugin:vue/essential",
    // 启用推荐的规则
    "eslint:recommended",
  ],
  // 别人可以直接使用你配置好的ESLint
  root: true,
  // 脚本在执行期间访问的额外的全局变量
  globals: {},
  // 启用的规则及其各自的错误级别
  rules: {
    // 禁止使用 console，提醒开发者，上线时要禁止
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // 禁止 debugger 语句，提醒开发者，上线时要禁止
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },

  // 指定解析器选项
  parserOptions: {
    parser: "babel-eslint",
  },
};
```

- 配置文件中引入规则配置

  - extends 扩展了（集成）配置，如 element 的
    - 增加了 eslint-plugin-vue 来更好的校验 vue 中的 js 代码。
    - 默认是严格的 plugin:vue/recommended 来校验代码，觉得太严格可修改为 essential。

  ```js
  npm install --save-dev eslint-config-elemefe

  'extends': [
      // 同时对 .vue 文件中的 js 代码进行检测，就需要利用 eslint-plugin-vue 插件来搭配使用。
      'plugin:vue/essential',
      // 启用推荐的规则
      'eslint:elemefe'
  ],
  ```

  - 或者覆盖规则，在 rules 中开启自定义
    - "semi"分号 和 "quotes"引号 是 ESLint 中 规则 的名称。第一个值是错误级别，可以使下面的值之一：
    - "off" or 0 - 关闭规则
    - "warn" or 1 - 将规则视为一个警告（不会影响退出码）
    - "error" or 2 - 将规则视为一个错误 (退出码为 1)

  ```js
  {
      "rules": {
          "semi": ["error", "always"],
          "quotes": ["error", "double"]
      }
  }
  ```

- 关闭校验
  - vcli3 以下：module.rules 中将 eslint-loader 给注释掉即可。
  - vcli3 以上：只要找到 vue.config.js 文件。 进行如下设置 lintOnSave: false 即可。
- 使用命令修复简单错误
  ```
  npm run lint -- --fix
  ```

## CodeReview

- 整体流程

  - 前期宣讲阶段：代码规范、最佳实践进行宣讲
  - 提交阶段：对着规范自测一遍，并整理 CodeReview 文档
  - 进行阶段：对问题代码进行 TODO 标注，交流最佳实践
  - 总结阶段：文档总结沉淀，记录问题，并进行代码整改

- 常见的代码问题
  - 魔鬼数字：应该用有意义的命名常量代替
  - 条件嵌套过多：尽早 return、使用键值对 map 优化
  - 异常情况没考虑：一些可能为空或者报错的地方，需要 try catch 或者给默认值
  - 组件太长：适当粒度拆分
- 有什么作用
  - 专业知识的共享和交流
  - 提高代码质量、保证团队代码规范
  - 帮助新人成长、提高个人表达能力
- 主要形式
  - 线上：通过 MR 看 commit 的功能点代码。由组长或者资深工程师进行 review，并在对应代码- 下进行评论
  - 线下：由主讲人展示，团队成员审核代码。主要有需求背景、设计方案、重要功能模块、- 问答等环节
- 时间选择
  - MR 之前由资深工程师对提交代码片段进行 review
  - 功能开发完成，全面提测之后，线下总结 review 文档，并组织开会讲解
- 规范宣讲
  - 代码规范
    - 禁止使用魔法数字
    - 减少重复代码
    - 使用全等号
    - 组件拆分，避免过长
  - 最佳实践
    - 边界和异常情况考虑
    - 条件判断优化
    - 一些按钮的防抖
- review 要求
  - 自测过代码
  - 讲重点模块
  - 代码片段不要太长

## 编码风格-分号

> 尤大总结：至于说 “很难总结什么时候加不加”，其实真的很简单。真正会导致上下行解析出问题的 token 有 5 个：括号，方括号，正则开头的斜杠，加号，减号。我还从没见过实际代码中用正则、加号、减号作为行首的情况，所以总结下来就是一句话：一行开头是括号或者方括号的时候加上分号就可以了，其他时候全部不需要。其实即使是这两种情况，在实际代码中也颇为少见。

- 大部分情况下：JS 引擎会自动为我们添加分号，叫自动分号插入(ASI)。
- 一些特殊场景：JS 判断不需要添加分号，就会导致问题，需要我们注意在特殊情况前面手动添加分号。
- 总结：如果不想在每句代码后面加分号，需要注意特殊情况如括号，方括号，正则开头的斜杠，加号，减号。在这些地方要手动加上分号。

- 使用 ESlint --fix 可以自动添加删除分号，风格迁移成本接近 0。
  - 配置 semi：
    - "always" （默认值）在语句结尾处需要分号
      ```js
      semi: ["error", "always"];
      ```
    - "never" 不允许分号作为语句的末尾（不包括那些为了消除歧义以 [，(，/，+，或 - 开头的语句）
      ```js
      semi: ["error", "never"];
      ```
    - 也可以用数字表示：0，1，2 分别表示 off, warning, error
