/**
 * 生成vue实例
 * 传入options 配置
 * 类似 
 * {  
 *  data:
 *    { msg: 'hello' }
 * }
 *  _proxyData方法将 data 中所有属性添加代理
 */

class Vue {
  constructor(options) {
    // 获取到传入的对象 没有默认为空对象
    this.$options = options || {}
    // 获取el
    this.$el = typeof options.el === 'string' ?
      document.querySelector(options.el) :
      options.$el
    // 获取 data
    this.$data = options.data || {}
    /**
     * 调用 _proxyData 处理 data中的属性
     * 主要目的：把 data的 的所有属性 加到 Vue 上,
     * 是为了以后方面操作可以用 Vue 的实例直接访问到 或者在 Vue 中使用 this 访问
     */
    this._proxyData(this.$data)
    // 使用 Obsever 把data中的数据转为响应式
    new Observer(this.$data)
    // 编译模板

    new Compiler(this)
  }

  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        // 可配置
        configurable: true,
        // 可枚举
        enumerable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          if (newVal === data[key]) return
          data[key] = newVal
        }
      })
    })
  }
}