module.exports = {
  title: "元气Blog", // 显示在左上角的网页名称以及首页在浏览器标签显示的title名称
  description: "元气Joe的前端世界", // meta 中的描述文字，用于SEO
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    [
      "link",
      { rel: "icon", href: "/wind.png" },
      //浏览器的标签栏的网页图标，第一个'/'会遍历public文件夹的文件
    ],
  ],
  //下面涉及到的md文件和其他文件的路径下一步再详细解释
  themeConfig: {
    sidebarDepth: 2,
    logo: "/wind.png", //网页顶端导航栏左上角的图标
    //顶部导航栏
    nav: [
      //格式一：直接跳转，'/'为不添加路由，跳转至首页
      { text: "首页", link: "/" },

      //格式二：添加下拉菜单，link指向的文件路径
      {
        text: "分类", //默认显示
        ariaLabel: "分类", //用于识别的label
        items: [
          { text: "文章", link: "/pages/folder1/html.md" },
          //点击标签会跳转至link的markdown文件生成的页面
          { text: "随笔", link: "/pages/folder2/test4.md" },
        ],
      },
      // { text: '功能演示', link: '/pages/folder2/test5.md' },

      //格式三：跳转至外部网页，需http/https前缀
      { text: "Github", link: "https://github.com/qq974837057" },
    ],

    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      "/pages/folder1/": [
        {
          title: "前端基础", // 一级菜单名称
          collapsable: false, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2, //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [
            ["html.md", "HTML"], //菜单名称为'子菜单1'，跳转至/pages/folder1/test1.md
            ["css.md", "CSS"],
            ["js.md", "JS"],
            ["ts.md", "TS"],
            ["browser.md", "HTTP与浏览器"],
          ],
        },
        {
          title: "前端进阶",
          collapsable: false,
          children: [
            ["design-pattern.md", "设计模式和架构"],
            ["performance.md", "性能优化"],
            ["refactor.md", "代码重构之道"],
            ["nodejs.md", "前沿与其他"],
          ],
        },
        {
          title: "前端框架",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            ["frame-common.md", "框架通识"],
            ["frame.md", "框架-Vue"],
            ["react.md", "框架-React"],
          ],
        },
        {
          title: "工程化和协作",
          collapsable: false,
          sidebarDepth: 2,
          children: [["webpack.md", "工程化与协作"]],
        },
        {
          title: "算法与编程",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            ["algorithm-data.md", "数据结构和算法-概念"],
            ["algorithm-sort.md", "数据结构和算法-排序专题"],
            ["algorithm-leetcode.md", "数据结构和算法-leetcode"],
            ["writeapi.md", "手写API实现"],
            // ['programme.md', '编程实现'],
          ],
        },
      ],

      //...可添加多个不同的侧边栏，不同页面会根据路径显示不同的侧边栏
      "/pages/folder2/": [
        {
          title: "日常思考", // 一级菜单名称
          collapsable: false, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2, //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [
            ["test4.md", "建设中"], //菜单名称为'子菜单1'，跳转至/pages/folder1/test1.md
          ],
        },
        {
          title: "日常记录",
          collapsable: false,
          children: [["test5.md", "建设中"]],
        },
      ],
    },
  },
};
