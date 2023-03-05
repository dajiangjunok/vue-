// 一个调度中心类，有一个存储观察者的集合，有添加观察者的方法，有通知观察者的方法
class Dep {
  constructor() {
    // 存储观察者
    this.subs = []
  }

  // 添加观察者
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }

  // 通知方法
  notify() {
    // 触发每个观察者的更新方法
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}