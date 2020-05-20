## Git
- 参考[廖雪峰的Git教程](https://www.liaoxuefeng.com/wiki/896043488029600/897013573512192)

### git checkout / git reset / git revert的区别
- 查找对应版本commit_id
    ```
    git log     //查看提交的版本历史
    git reflog  //查看所有命令历史，包括已被回退的commit id
    ```
- 本地撤回修改
    - 丢弃工作区的修改或者是已add后的修改（**路径要找对才可以**，要进入对应的文件夹）
        ```
        git checkout -- filename    // 彻底丢弃某个文件的改动
        git checkout .              // 放弃本地所有改动
        ```
    - 已git add 添加到暂存区，退回工作区，再执行上一步
        ```
        git reset HEAD filename   // 放弃指定文件的缓存（HEAD表示最新版本）
        git reset HEAD .          // 放弃所有的缓存
        ```
    - 已git commit 添加到本地历史记录区
        ```
        git reset --hard commit_id  // 自己分支使用的版本回退，丢弃已commit的其他版本
        git reset --hard HEAD^      // 上一次commit的版本
        ```
    - HEAD表示最新提交 ；HEAD^上一次； HEAD~n表示第n次(从0开始，表示最近一次)

- 版本回退-自己分支：自己的分支回退直接用git reset，根据设定的commit_id来回移动HEAD
    - --hard：影响工作区、暂存区和历史记录区
    - --mixed：影响到暂存区和历史记录区。（默认）
    - --soft：只影响历史记录区
    - 工作区：在 git 管理下的正常目录都算是工作区，我们平时的编辑工作都是在工作区完成
    - 暂存区：git add之后的临时区域，里面存放将要提交文件的快照
    - 历史记录区：git commit 后的记录区
    ```
    git reset --hard commit_id
    git push -f         // 强制推送远程分支
    ```

- 版本回退-公共分支：如develop回滚用revert，**产生一次新的提交**（避免丢掉成员的提交）
    ```
    git revert 0ffaacc     // 撤销0ffaacc这次提交
    git revert HEAD        // 撤销最近一次提交
    git revert HEAD~1      // 撤销最近2次提交，注意：数字从0开始
    git push -f            // 强制推送远程分支
    ```

### git merge / git rebase 的区别
- [知乎解释](https://zhuanlan.zhihu.com/p/75499871)
- [git解释](https://github.com/geeeeeeeeek/git-recipes/wiki/5.1-%E4%BB%A3%E7%A0%81%E5%90%88%E5%B9%B6%EF%BC%9AMerge%E3%80%81Rebase-%E7%9A%84%E9%80%89%E6%8B%A9)
- [其他解释](https://www.html.cn/archives/10077)
- 较好实践：就是dev在merge进主分支（如master）之前，最好将自己的dev分支给rebase到最新的主分支（如master）上，然后用pull request创建merge请求。用rebase整理成重写commit历史，所有修改拉到master的最新修改前面，保证dev运行在当前最新的主branch的代码。避免了合并的交织。
- 一句话：rebase将多次commit一起拉到要合并进来分支最新提交的前面，变成一条线。merge会保留两个分支的commit信息，而且是交叉着的，即使是ff模式，两个分支的commit信息会混合在一起。
- git merge ：自动创建一个新的合并commit，且包含两个分支记录， 如果合并的时候遇到冲突，仅需要修改后重新commit
    - 场景：如dev要合并进主分支master，保留详细的合并信息。
    - 优点：真实的commit情况
    - 缺点：分支杂乱
        ```
        $ git checkout feature
        $ git merge master
        ```
- git rebase：不产生merge commit，重写提交历史，“整理”成一条直线。
    - 如在develop上git rebase master 就会拉取到master上的最新代码合并进来，也就是将分支的起始时间指向master上最新的commit上。自动保留的最新近的修改，不会遇到合并冲突。而且可交互操作（执行合并删除commit），可通过交互式变基来合并分支之前的commit历史git rebase -i HEAD~3
    - 场景：主要发生在个人分支上，如 git rebase master整理自己的dev变成一条线。频繁进行了git commit提交，可用交互操作drop删除一些提交，squash提交融合前一个提交中。
    - 优点：简洁的提交历史
    - 缺点：发生错误难定位
        ```
        $ git checkout feature
        $ git rebase master
        ```
- review（强制+发版前+小片段+线上交流+高频率）（代码交流和人员成长，辅助产品质量）
    - 代码规范：明确Coding规则
    - 检视指南：消除困惑和迷茫
    - 总结优化：透明问题，持续优化（非常重要）
    - 激励机制：激发主观能动性
![测试图](./img/git-merge.png)
![测试图](./img/git-rebase.png)