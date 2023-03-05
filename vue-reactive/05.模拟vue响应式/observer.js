/**
 * observer 把data中的属性变为响应式加在自身的身上
 * 还有一个主要功能就是 观察者模式
 */

/**
 * data: 观察的对象
 */
class Observer {
  constructor(data) {
    // walk来遍历对象，内部再对对应属性key添加响应式
    this.walk(data)
  }

  walk(data) {
    // 判断 data 是否为空 和 对象
    if (!data || typeof data !== 'object') return

    // 遍历
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  /**
   * 
   * @param {被添加响应式的对象} obj 
   * @param {被添加响应式的属性} key 
   * @param {被添加响应式属性的值} value 
   */
  defineReactive(obj, key, value) {
    this.walk(value) // 递归对象,为所有值类型不为object属性添加响应式
    // 存储this
    const self = this
    // 创建 Dep 对象
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 在这里添加观察者对象 Dep.target 表示观察者
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newVal) {
        if (newVal === value) return

        value = newVal
        // 赋值的话如果是newValue是对象，对象里面的属性也应该设置为响应式的
        self.walk(newVal)
        // 触发通知 更新视图
        dep.notify()
      }
    })
  }
}