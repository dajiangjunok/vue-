// 实现对文本节点 和 元素节点指令编译

class Compiler {
  // 出入Vue实例
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el

    // 初始化就要编译模板，因此这里需要进行编译
    this.compile(this.el)
  }

  compile(el) {
    // 获取该el下的所有nodeList（nodeList 都是伪数组，需转为数组进行操作）
    const childNodes = [...el.childNodes]

    childNodes.forEach(node => {
      // 根据不同的节点类型进行编译
      // 文本类型的节点
      if (this.isTextNode(node)) {
        // 编译文本节点
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 编译元素节点
        this.compileElement(node)
      }

      // 判断是否存在子节点考虑递归
      if (node.childNodes && node.childNodes.length) {
        // 继续递归编译模板
        this.compile(node)
      }
    })
  }

  // 编译文本节点（简易实现）
  compileText(node) {
    // 核心思想利用把正则表达式把{{}}去掉找到里面的变量
    // 再去Vue找这个变量赋值给node.textContent
    let reg = /\{\{(.+?)\}\}/
    // 获取节点的文本内容
    let val = node.textContent

    // 判断是否有 {{}}
    if (reg.test(val)) {
      // 获取分组一  也就是 {{}} 里面的内容 去除前后空格
      let key = RegExp.$1.trim()

      // 进行替换再赋值给node
      node.textContent = val.replace(reg, this.vm[key])

      // 创建观察者
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }

  // 编译元素节点（这里单处理指令）
  compileElement(node) {
    // 获取到元素节点上面的所有属性进行遍历(node.attributes 返回一个map对象)
    ![...node.attributes].forEach((attr) => {
      // 获取属性名
      let attrName = attr.name
      // 判断是否是 v- 开头的指令
      if (this.isDirective(attrName)) {
        // 除去 v- 方便操作
        attrName = attrName.substr(2)
        // 获取 指令的值就是  v-text = "msg"  中msg
        // msg 作为 key 去Vue 找这个变量
        let key = attr.value
        // 指令操作 执行指令方法
        // vue指令很多为了避免大量个 if判断这里就写个 uapdate 方法
        this.update(node, key, attrName)
      }
    })
  }

  // 添加指令方法，并且执行
  update(node, key, attrName) {
    // 如textUpdater 就是用来处理v-text
    // 我们应该就内置一个 textUpdater 方法进行调用
    // 加个后缀加什么无所谓但是要定义相应的方法
    let updateFn = this[attrName + 'Updater']
    // 如果存在这个内置方法 就可以调用了
    updateFn && updateFn(node, key, this.vm[key], self = this)
  }

  // 提前写好 相应的指定方法比如这个 v-text
  // 使用的时候 和 Vue 的一样
  textUpdater(node, key, value, self) {
    node.textContent = value
    // 创建观察者2
    new Watcher(self.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }

  // v-model
  modelUpdater(node, key, value, self) {
    node.value = value
    // 创建观察者
    new Watcher(self.vm, key, (newValue) => {
      node.value = newValue
    })
    // 这里实现双向绑定 监听input 事件修改 data中的属性
    node.addEventListener('input', () => {
      self.vm[key] = node.value
    })
  }

  // 判断元素的属性是否是 vue 指令
  isDirective(attr) {
    return attr.startsWith('v-')
  }
  // 判断是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
  // 判断是否是 文本 节点
  isTextNode(node) {
    return node.nodeType === 3
  }
}