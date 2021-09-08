- 参考[廖雪峰的 Git 教程](https://www.liaoxuefeng.com/wiki/896043488029600/897013573512192)

## Git flow 工作流

- 两个长期分支
  - 主分支 master:稳定的发布版（已发布代码）（一般有保护功能）
  - 主开发分支 develop:最新的开发代码
- 三个短期分支（用完该删除）
  - 新功能分支 feature:开发新功能（由 develop 分支上面分出来，开发完并入 Develop）
  - 预发布分支 release:发布前的测试复查、版本控制、缺陷修复、（由 Develop 分支上面分出来，结束后并入 develop 和 master）
  - 补丁分支 hotfix:紧急修复 bug(issue 编号+名字)，从 master 上某个 tag 创建，修补结束，写上"fixes #14" 合并如 master 和 develop。
- 特点：
  - 基于版本发布
  - 优点是清晰可控
  - 缺点是相对复杂，需要同时维护两个长期分支。
  - Github flow 适合持续发布，只有一个长期分支就是 master
  - GitLab flow 上游 master 优先，由 master 分出其他分支如 production，去发布版本。上游没问题，才合并到下游。
- 总流程
  - 并行开发：新功能新建 feature 分支，开发完后合并到主开发分支 develop
  - 协作开发：从 develop 上创建新分支，即包括所有已完成的 feature
  - 预发布：develop 上创建一个 release 分支，发布到测试环境测试，有问题在此分支修复，修复完毕合并到 develop 和 master 分支。
  - 紧急修复：在已发布的 tag 上新建修复 hotfix 分支，修补结束合并如 master 和 develop。
- tag
  - 概念：对某个提交点打上标签，如发布版本后打 tag。
  - 作用：便于以后回滚特定版本，而不需要 revert。

![Git-flow](./img/Git-flow.png)

## Git 的区域

画了一个简单的示意图，供大家参考

![yuque_diagram.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1e7850494c048c99132d4723a8281a7~tplv-k3u1fbpfcp-watermark.image)

- 远程仓库（Remote）：在远程用于存放代码的服务器，远程仓库的内容能够被分布其他地方的本地仓库修改。
- 本地仓库（Repository）：在自己电脑上的仓库，平时我们用 git commit 提交到暂存区，就会存入本地仓库。
- 暂存区（Index）：执行 `git add` 后，工作区的文件就会被移入暂存区，表示哪些文件准备被提交，当完成某个功能后需要提交代码，可以通过 `git add` 先提交到暂存区。
- 工作区（Workspace）：工作区，开发过程中，平时打代码的地方，看到是当前最新的修改内容。

## Git 的基本使用场景

以下命令远程主机名默认为`origin`，如果有其他远程主机，将`origin`替换为其他即可。

### git fetch

```bash
# 获取远程仓库特定分支的更新
git fetch origin <分支名>

# 获取远程仓库所有分支的更新
git fetch --all
```

### git pull

```bash
# 从远程仓库拉取代码，并合并到本地，相当于 git fetch && git merge
git pull origin <远程分支名>:<本地分支名>

# 拉取后，使用rebase的模式进行合并
git pull --rebase origin <远程分支名>:<本地分支名>
```

注意

- 直接 git pull 不加任何选项，等价于`git fetch + git merge FETCH_HEAD`，执行效果就是会拉取所有分支信息回来，但是只合并当前分支的更改。其他分支的变更没有执行合并。
- 使用 git pull --rebase 可以减少冲突的提交点，比如我本地已经提交，但是远程其他同事也有新的代码提交记录，此时拉取远端其他同事的代码，如果是 merge 的形式，就会有一个 merge 的 commit 记录。如果用 rebase，就不会产生该合并记录，是将我们的提交点挪到其他同事的提交点之后。

### git branch

```bash
# 基于当前分支，新建一个本地分支，但不切换
git branch <branch-name>

# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看本地和远程分支
git branch -a

# 删除本地分支
git branch -D <branch-name>

# 基于旧分支创建一个新分支
git branch <new-branch-name> <old-branch-name>

# 基于某提交点创建一个新分支
git branch <new-branch-name> <commit-id>

# 重新命名分支
git branch -m <old-branch-name> <new-branch-name>
```

### git checkout

```bash
# 切换到某个分支上
git checkout <branch-name>

# 基于当前分支，创建一个分支并切换到新分支上
git checkout -b <branch-name>
```

### git add

```bash
# 添把当前工作区修改的文件添加到暂存区，多个文件可以用空格隔开
git add xxx

# 添加当前工作区修改的所有文件到暂存区
git add .
```

### git commit

```bash
# 提交暂存区中的所有文件，并写下提交的概要信息
git commit -m "message"

# 相等于 git add . && git commit -m
git commit -am

# 对最近一次的提交的信息进行修改，此操作会修改commit的hash值
git commit --amend
```

### git push

```bash
# 推送提交到远程仓库
git push

# 强行推送到远程仓库
git push -f
```

### git tag

```bash
# 查看所有已打上的标签
git tag

# 新增一个标签打在当前提交点上，并写上标签信息
git tag -a <version> -m 'message'

# 为指定提交点打上标签
git tag -a <version> <commit-id>

# 删除指定标签
git tag -d <version>
```

## Git 的进阶使用场景

> HEAD 表示最新提交 ；HEAD^表示上一次； HEAD~n 表示第 n 次（从 0 开始，表示最近一次）

### 正常协作

- `git pull` 拉取远程仓库的最新代码
- 工作区修改代码，完成功能开发
- `git add .` 添加修改的文件到暂存区
- `git commit -m 'message'` 提交到本地仓库
- `git push`将本地仓库的修改推送到远程仓库

### 代码合并

#### git merge

自动创建一个新的合并提交点`merge-commit`，且包含两个分支记录。如果合并的时候遇到冲突，仅需要修改解决冲突后，重新 commit。

- 场景：如**dev 要合并进主分支 master**，保留详细的合并信息
- 优点：展示真实的 commit 情况
- 缺点：分支杂乱

```bash
git checkout master
git merge dev
```

![rf1o2b6eduboqwkigg3w.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25dbbe263dc9400b9c51ede7ca85632f~tplv-k3u1fbpfcp-zoom-1.image)

#### git merge 的几种模式

- `git merge --ff` （默认--ff,fast-farward）
  - 结果：被 merge 的分支和当前分支在图形上并为一条线，被 merge 的提交点 commit 合并到当前分支，没有新的提交点 merge
  - 缺点：代码合并不冲突时，默认快速合并，主分支按时间顺序混入其他分支的零碎 commit 点。而且删除分支，会丢失分支信息。
- `git merge --no-ff`（不快速合并、推荐）
  - 结果：被 merge 的分支和当前分支不在一条线上，被 merge 的提交点 commit 还在原来的分支上，并在当前分支产生一个新提交点 merge
  - 优点：代码合并产生冲突就会走这个模式，利于回滚整个大版本(主分支自己的 commit 点)
- `git merge --squash`（把多次分支 commit 历史压缩为一次）
  - 结果：把多次分支 commit 历史压缩为一次

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/70ab71b89bb74c248b8b7098383a04e0~tplv-k3u1fbpfcp-zoom-1.image)

#### git rebase

- 不产生`merge commit`，变换起始点位置，“整理”成一条直线，且能使用命令合并多次 commit。
- 如在 develop 上`git rebase master` 就会拉取到 master 上的最新代码合并进来，也就是将分支的起始时间指向 master 上最新的 commit 上。自动保留的最新近的修改，不会遇到合并冲突。而且可交互操作（执行合并删除 commit），可通过交互式变基来合并分支之前的 commit 历史`git rebase -i HEAD~3`
- 场景：主要**发生在个人分支**上，如 `git rebase master`整理自己的 dev 变成一条线。频繁进行了 git commit 提交，可用交互操作`drop`删除一些提交，`squash`提交融合前一个提交中。
- 优点：简洁的提交历史
- 缺点：发生错误难定位，解决冲突比较繁琐，要一个一个解决。

```bash
git checkout dev
git rebase master
```

![dwyukhq8yj2xliq4i50e.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66b9c66445c44aee91a5587b887a8e27~tplv-k3u1fbpfcp-zoom-1.image)![msofpv7k6rcmpaaefscm.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4b1de83531a41c38983ce025d356843~tplv-k3u1fbpfcp-zoom-1.image)

#### git merge 和 git rebase 的区别

- merge 会保留两个分支的 commit 信息，而且是交叉着的，即使是 ff 模式，两个分支的 commit 信息会混合在一起（按真实提交时间排序），多用于自己 dev 合并进 master。
- rebase 意思是变基，改变分支的起始位置，在 dev 上`git rebase master`，将 dev 的多次 commit 一起拉到要 master 最新提交的后面(时间最新)，变成一条线，多用于整理自己的 dev 提交历史，然后把 master 最新代码合进来。
- 使用 rebase 还是 merge 更多的是管理风格的问题，有个较好实践：
  - 就是 dev 在 merge 进主分支（如 master）之前，最好在自己的 dev 分支上，执行 rebase master 主分支，然后用 pull request 或 MR 创建普通 merge 请求。
  - 用 rebase 整理成重写 commit 历史，所有修改拉到 master 的最新修改前面，保证 dev 运行在当前最新的主 branch 的代码。避免了 git 历史提交里无意义的交织。
- 假设场景：从 dev 拉出分支 feature-a。
  - 那么当 dev 要合并 feature-a 的内容时，使用 `git merge feature-a`
  - 反过来当 feature-a 要更新 dev 的内容时，使用 `git rebase dev`
- git merge 和 git rebase 两者对比图
  - git merge 图示 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/857ac736dd8146dca76e89cad23c7c22~tplv-k3u1fbpfcp-zoom-1.image)
  - git rebase 图示 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da1899fbaf6e4a9295e3e6540ce5d6af~tplv-k3u1fbpfcp-zoom-1.image)

#### 取消合并

```bash
# 取消merge合并
git merge --abort
# 取消rebase合并
git rebase --abort
```

### 代码回退

#### 代码回退的几种方式

- `git checkout`
- `git reset`
  - `--hard`：硬重置，影响【工作区、暂存区、本地仓库】
  - `--mixed`：默认，影响【暂存区、本地仓库】，被重置的修改内容还留在工作区
  - `--soft`：软重置，影响 【本地仓库】，被重置的修改内容还留在工作区和暂存区
- `git revert`

```bash
# 撤回工作区该文件的修改，多个文件用空格隔开
git checkout -- <file-name>
# 撤回工作区所有改动
git checkout .

# 放弃已git add到暂存区的指定文件的缓存（HEAD表示最新版本）
git reset HEAD <file-name>
# 放弃所有的缓存
git reset HEAD .
# 丢弃已commit的其他版本，hard参数表示同时重置工作区的修改
git reset --hard <commit-id>
# 回到上一个commit的版本，hard参数表示同时重置工作区的修改
git reset --hard HEAD^

# 撤销0ffaacc这次提交
git revert 0ffaacc
# 撤销最近一次提交
git revert HEAD
# 撤销最近2次提交，注意：数字从0开始
git revert HEAD~1

# 回退后要执行强制推送远程分支
git push -f
```

#### git reset 和 git revert 的区别

- reset 是根据<commit-id>来移动 HEAD 指针，在该次提交点后面的提交记录会丢失。
  ![hlh0kowt3hov1xhcku38.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbdf4d8c134640e6b8e97c34ceee4d07~tplv-k3u1fbpfcp-zoom-1.image)
- revert 会产生新的提交，来抵消选中的该次提交的修改内容，可以理解为“反做”，不会丢失中间的提交记录。
  ![3kkd2ahn41zixs12xgpf.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e68ae4f29e6c4347a0c1c85d9a79dfe9~tplv-k3u1fbpfcp-zoom-1.image)
- 使用建议
  - 公共分支回退使用 git revert，避免丢掉其他同事的提交。
  - 自己分支回退可使用 git reset，也可以使用 git revert，按需使用。

### 挑拣代码

`git cherry-pick`

- “挑拣”提交，单独抽取某个分支的一个提交点，将这个提交点的所有修改内容，搬运到你的当前分支。
- 如果我们只想将其他分支的某个提交点合并进来，不想用`git merge`将所有提交点合并进来，就需要使用这个`git cherry-pick`。

```bash
git cherry-pick <commit-id>
```

![2dkjx4yeaal10xyvj29v.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a3947957a9140c9a49944b80a6206af~tplv-k3u1fbpfcp-zoom-1.image)

### 暂存代码

`git stash`

- 当我们想要切换去其他分支修复 bug，此时当前的功能代码还没修改完整，不想 commit，就需要暂存当前修改的文件，然后切换到 hotfix 分支修复 bug，修复完成再切换回来，将暂存的修改提取出来，继续功能开发。
- 还有另一种场景就是，同事在远程分支上推送了代码，此时拉下来有冲突，可以将我们自己的修改 stash 暂存起来，然后先拉最新的提交代码，再 pop 出来，这样可以避免一个冲突的提交点。

```bash
# 将本地改动的暂存起来
git stash
# 将未跟踪的文件暂存（另一种方式是先将新增的文件添加到暂存区，使其被git跟踪，就可以直接git stash）
git stash -u
# 添加本次暂存的备注，方便查找。
git stash save "message"
# 应用暂存的更改
git stash apply
# 删除暂存
git stash drop
# 应用暂存的更改，然后删除该暂存，等价于git stash apply + git stash drop
git stash pop
# 删除所有缓存
git stash clear
# 查看缓存列表
git stash list
```

### 打印日志

1. ​`git log`

可以显示所有提交过的版本信息，如果感觉太繁琐，可以加上参数  `--pretty=oneline`，只会显示版本号和提交时的备注信息。

2. ​`git reflog`

​`git reflog`  可以查看所有分支的所有操作记录（包括已经被删除的 commit 记录和 reset 的操作），例如执行 `git reset --hard HEAD~1`，退回到上一个版本，用 git log 是看不出来被删除的<commit-id>，用`git reflog`则可以看到被删除的<commit-id>，我们就可以买后悔药，恢复到被删除的那个版本。

## Git 的下载、配置、工具推荐

- Git 下载地址
  - [https://git-scm.com/downloads](https://git-scm.com/downloads)
- 两种拉取代码的方式
  - https：每次都要手动输入用户名和密码
  - ssh ：自动使用本地私钥+远程的公钥验证是否为一对秘钥
- 配置 ssh
  - `ssh-keygen -t rsa -C "邮箱地址"`
  - `cd ~/.ssh`切换到 home 下面的 ssh 目录、`cat id_rsa.pub`命令查看公钥的内容，然后复制
  - github 的`settings` -> `SSH and GPG keys`-> 复制刚才的内容贴入 -> `Add SSH key`
  - 全局配置一下 Git 用户名和邮箱
    - `git config --global user.name "xxx"`
    - `git config --global user.email "xxx@xx.com"`
    - ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d071e482abf42eabd3be08da8b655eb~tplv-k3u1fbpfcp-zoom-1.image)
- Git 相关工具推荐
  - 图形化工具[ SourceTree ](https://www.sourcetreeapp.com/)：可视化执行 git 命令，解放双手
  - VSCode 插件 [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)：可以在每行代码查看对应 git 的提交信息，而且提供每个提交点的差异对比
