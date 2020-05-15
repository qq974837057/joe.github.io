
### HTML 语义化
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

