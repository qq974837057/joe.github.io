## 总览
![排序全览](./img/algo-sort-all.jpg)
![排序常用前五](./img/algo-sort-top5.jpg)
![排序最低复杂度](./img/algo-sort-fast.jpg)

#### 名词解释
- k: “桶”的个数
- In-place: 占用常数内存，不占用额外内存
- Out-place: 占用额外内存
- 稳定: 排序后2个相等键值的顺序和排序之前它们的顺序相同

## 冒泡排序
![冒泡排序](./img/algo-sort-bubble.gif)
#### 思路
> 循环数组，比较前后元素，较大者往后冒泡。

- 第一次循环后，最后一个数为数组的最大数。
- 下一次循环继续上面操作，不循环已排序好的数。
- 优化：设置标志位complete，当一次循环没有发生冒泡，表示排序完成，跳出循环并返回。

#### 代码实现
  ```js
  // 第一层i < len - 1      因为最后一次就只有一个数，不用再循环了。
  // 第二层j < len - 1 - i  忽略尾部已经排好序的i项(也就是较大值)。
  function bubbleSort(arr) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
      let complete = true;
      for (let j = 0; j < len - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          complete = false;
        }
      }
      if (complete) {
        break;
      }
    }
    return arr;
  }
  ```

#### 复杂度和稳定性

- 时间复杂度：平均O(n^2)、最坏O(n^2)、最好O(n)
- 空间复杂度：O(1)
- 稳定性：稳定

## 插入排序
![插入排序](./img/algo-sort-insert.gif)
#### 思路
> 类似扑克摸牌后插入，左侧看成有序序列，每次将一个数字插入该序列对应的位置。

- 插入时按从有序序列最右侧比较，比较大的数后移一位。
- 第一层循环从下标1开始，和下标0进行比较
- 当target小于前一位j的值，则互换位置，把大的值后移，target大于j，则退出该次循环。

#### 代码实现
  ```js
  function insertSort(arr) {
    let len = arr.length;
    for (let i = 1; i < len; i++) {
      let target = i;
      for (let j = i - 1; j >= 0; j--) {
        if (arr[target] < arr[j]) {
          [arr[target], arr[j]] = [arr[j], arr[target]];
          target = j;
        } else {
          break;
        }
      }
    }
    return arr;
  }
  ```

#### 复杂度和稳定性

- 时间复杂度：平均O(n^2)、最坏O(n^2)、最好O(n)
- 空间复杂度：O(1)
- 稳定性：稳定

## 选择排序
![选择排序](./img/algo-sort-select.gif)

#### 思路
> 每次循环选后面最小的一个数字放到前面的有序序列。

- i=0开始外层循环，假设下标i为最小坐标minIndex，j=i+1开始内层循环，每次循环如果j的值比最小坐标minIndex的值小，则将最小坐标minIndex替换成j。
- 然后i和最小坐标minIndex互换位置。

#### 代码实现
  ```js
  function selectSort(arr) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < len; j++) {
        if(arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      [arr[minIndex], arr[i]] = [arr[i], arr[minIndex]];
    }
    return arr;
  }
  ```

#### 复杂度和稳定性

- 时间复杂度：平均、最好、最坏均为O(n^2)
- 空间复杂度：O(1)
- 稳定性：不稳定
  - 如[5, 8, 5, 2] 第一次选择最小为2，把2和第一个5交换后，两个5的顺序就变了

#### 以上三种排序总结：

- 选择顺序：插入>冒泡>选择（插入还是比较有用）
- 优点：实现简单，适合小规模数据排序，比较高效。
- 缺点：大规模数据时间复杂度有点高。
- 相同：都是原地排序算法，都是用比较的算法，涉及两种操作，比较和交换。