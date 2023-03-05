// 数据更新后 收到通知之后 调用 update 进行更新

class Watcher {
  constructor(vm, key, cb) {
    // vm是vue实例
    this.vm = vm
    // key 是 data中的属性
    this.key = key
    // cb是更新试图的回调方法
    this.cb = cb

    // 首先把观察者存入Dep的静态属性target
    Dep.target = this
    // 旧数据 更新视图的时候要进行比较
    // 还有一点就是 vm[key] 这个时候就触发了 get 方法
    // 之前在 get 把 观察者 通过dep.addSub(Dep.target) 添加到了 dep.subs中
    this.oldValue = vm[key]
    // Dep.target 就不用存在了，因为上面操作已经存好
    Dep.target = null
  }

  // 观察者者中的必备方法，用来更新视图
  update() {
    // 获取新值
    let newValue = this.vm[this.key]
    // 比较旧值和更新方法
    if (newValue === this.oldValue) return
    // 调用具体的更新方法
    this.cb(newValue)
  }
}