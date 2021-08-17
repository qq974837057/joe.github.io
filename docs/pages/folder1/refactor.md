## 项目重构

### 重构是什么

- 重构就是改善现有代码的设计，具体就是不影响代码功能的情况下，对内部结构进行的一种调整。

### 为什么要重构

- 提高代码可读性：让代码更容易理解
- 降低维护的成本：快速定位 BUG
- 改善代码结构设计：一是短期目的地修改代码，容易失去原有结构；二是一开始没有完美的设计，需要实践找到更优的设计。

### 重构原则

- 保持编程状态：要么是在重构，要么是在增加新功能，不能一边重构一边新加功能。
- 重构片段要小：保证每一步可控制，比如分步骤重构，先改全局变量，后改条件判断。

### 重构的时机

- 完成新功能 、code review 时：迭代进度可控的情况下，及时完成代码优化，避免以后被“封存”。
- 代码混乱，难以增加新功能时：添加功能十分困难，牵一发动全身，此时需要重构，甚至重写。

那么业务紧急，但又迫切需要重构如何选择

- 新模块考虑直接重新写，保证迭代正常完成。旧模块建议先融入并整理逻辑，待后期业务不紧急考虑进行重构。

### 什么情况下不应该重构

- 重写比重构更快
- 某个功能不需要迭代且运行良好
- 修改公用库，但未经过沟通

### 重构的代码方案

#### 修改为有意义的变量命名

- 有意义
- 有关联的
- 统一风格的

#### 避免魔法数字

- 数字需要用有意义的常量名表示，让其语义化
- 不然很难猜出到底数字是起什么作用的

#### 避免重复代码

- 减少拷贝
- 将可以复用的代码片段抽取出来成为公共的函数
- 避免一处改动，处处都要跟着改动的情况

#### 避免太长的函数、太长的函数参数

- 一个函数避免超过 80 行，太长的函数难以理解
- 简短的函数容易理解，还可以降低耦合度，利于组合使用
- 函数参数一般不要超过 5 个，会导致难以使用

#### 封装判断条件

- 将复杂的条件表达式变成有意义的函数，并返回值，通过函数名就可以理解，提高可读性

```js
// bad
if (!date.isBefore(plan.summberStart) && !date.isAfter(plan.summberEnd)) {
  charge = quantity * plan.summerRate;
} else {
  charge = quantity * plan.regularRate + plan.regularServiceCharge;
}

// good
if (isSummer()) {
  charge = quantity * plan.summerRate;
} else {
  charge = quantity * plan.regularRate + plan.regularServiceCharge;
}

// perfect
isSummer() ? summerCharge() : regularCharge();
```

#### 复杂的条件嵌套优化

1. 使用卫语句

- 表达前面这些函数，不是本函数的核心逻辑，如果遇到了，会返回一个函数进行处理，然后提前退出。
- 有点类似错误前置的感觉

  ```js
  function getPayAmount() {
    let result;
    if (isDead) {
      // do sth and assign to result
    } else {
      if (isSeparated) {
        // do sth and assign to result
      } else {
        if (isRetired) {
          // do sth and assign to result
        } else {
          // do sth and assign to result
        }
      }
    }

    return result;
  }
  ```

  ```js
  function getPayAmount() {
    if (isDead) return deatAmount();
    if (isSeparated) return serparateAmount();
    if (isRetired) return retiredAmount();
    return normalPayAmount();
  }
  ```

2. 使用键值对

```js
// bad
if (this.rateName === "firstDraftRate") {
  this.stage = 1;
} else if (this.rateName === "finalDraftRate") {
  this.stage = 2;
} else if (this.rateName === "recordVideoRate") {
  this.stage = 3;
} else if (this.rateName === "wordStatusRate") {
  this.stage = 4;
} else if (this.rateName === "teachVideoRate") {
  this.stage = 5;
}

// good
this.stage = {
  firstDraftRate: 1,
  finalDraftRate: 2,
  recordVideoRate: 3,
  wordStatusRate: 4,
  teachVideoRate: 5,
}[this.rateName];
```

```js
// bad
genStatus(status) {
  switch (status) {
    case 0:
      return '未完成';
    case 1:
      return '按时完成';
    case 2:
      return '已逾期';
    case 3:
      return '逾期完成';
    case 4:
      return '未提交';
  }
}

// good
const STATUS = {
  0: '未完成',
  1: '按时完成',
  2: '已逾期',
  4: '未提交'
};
genStatus(status) {
  return STATUS[status];
}
```

3. 使用策略模式

```js
// bad
function logMessage(message = "CRITICAL::The system ...") {
  const parts = message.split("::");
  const level = parts[0];

  switch (level) {
    case "NOTICE":
      console.log("Notice");
      break;
    case "CRITICAL":
      console.log("Critical");
      break;
    case "CATASTROPHE":
      console.log("Castastrophe");
      break;
  }
}
```

```js
// good
const strategies = {
  criticalStrategy,
  noticeStrategy,
  catastropheStrategy,
};
function logMessage(message = "CRITICAL::The system ...") {
  const [level, messageLog] = message.split("::");
  const strategy = `${level.toLowerCase()}Strategy`;
  const output = strategies[strategy](messageLog);
}
function criticalStrategy(param) {
  console.log("Critical: " + param);
}
function noticeStrategy(param) {
  console.log("Notice: " + param);
}
function catastropheStrategy(param) {
  console.log("Catastrophe: " + param);
}
logMessage();
logMessage("CATASTROPHE:: A big Catastrophe");
```

#### 函数式编程替代命令式(视情况)

```js
// for
const programmerNames = [];
for (const item of people) {
  if (item.job === "programmer") {
    programmerNames.push(item.name);
  }
}

// pipeline
const programmerNames = people
  .filter((item) => item.job === "programmer")
  .map((item) => item.name);
```

### 参考

- [腾讯重构指北](https://mp.weixin.qq.com/s/ciKbBI0EKsM_TqKiicAocQ)
- [代码简洁之道-重构](https://mp.weixin.qq.com/s/PYu4x2SG4Oq7VOkUXPaGPQ)
- [代码简洁之道-复杂判断](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651247297&idx=1&sn=24e904607b224e954c7d0d130e792890&chksm=bd490b458a3e82532504bef31d5dacb0148515d3bf59bfa90117d97869d5fa2090299ff56af2&mpshare=1&scene=1&srcid=0628OWrpEM51vZY6rDEpjLZx&sharer_sharetime=1624843153122&sharer_shareid=f72feefcc9c2c137677aa7f49d02e0f4&version=3.1.10.3010&platform=win#rd)
