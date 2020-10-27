// 用法  new Compile(el,vm)

class Compile {
  constructor(el, vm) {
    // 要遍历的数组节点
    this.$el = document.querySelector(el);
    this.$vm = vm;

    // 编译
    if (this.$el) {
      // 转换内部为片段Fragment
      this.$fragment = this.node2Fragment(this.$el);
      // 执行编译
      this.compile(this.$fragment);
      // 将编译完的html结果追加至$el
      this.$el.appendChild(this.$fragment);
    }
  }

  // 作用：将宿主元素中代码片段拿出来便利，这样做比较高效果
  node2Fragment (el) {
    const frag = document.createDocumentFragment();
    // 将el中所有子元素搬家至frag中
    let child;
    while (child = el.firstChild) {
      frag.appendChild(child)
    }
    return frag;
  }

  // 编译
  compile (el) {
    const childNodes = el.childNodes;
    // console.log(childNodes);
    Array.from(childNodes).forEach(node => {
      // 类型判断
      if (this.isElement(node)) {
        // 元素
        // console.log('编译元素' + node.nodeName);
        // 查找 j- ， @  ， ：开头的
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
          const attrName = attr.name; //属性名
          const exp = attr.value; //属性值

          // 判断是指令还是事件
          if (this.isDirective(attrName)) {
            // j-text 
            const dir = attrName.substring(2);
            // 执行指令
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if (this.isEvent(attrName)) {
            const dir = attrName.substring(1); // @click
            this.eventHandle(node, this.$vm, exp, dir);
          }
        })
      } else if (this.isInterpolation(node)) {
        // 插值文本
        // console.log('编译文本' + node.textContent);
        this.compileText(node);
      }

      // 递归字节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }
  compileText (node) {
    // 走到这说明是一个插值表达式
    // console.log(RegExp.$1);
    this.update(node, this.$vm, RegExp.$1, 'text')
  }

  // 更新函数
  update (node, vm, exp, dir) {
    const updaterFn = this[dir + 'Updater'];
    // 初始化
    updaterFn && updaterFn(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp, function (value) {
      updaterFn && updaterFn(node, value);
    })
  }

  text (node, vm, exp) {
    this.update(node, vm, exp, 'text')
  }

  // 双向数据绑定
  model (node, vm, exp) {
    // 要指定input 的value属性 
    this.update(node, vm, exp, "model");

    // 视图对模型的响应
    node.addEventListener("input", e => {
      vm[exp] = e.target.value;
    })
  }

  modelUpdater (node, value) {
    node.value = value;
  }

  html (node, vm, exp) {
    this.update(node, vm, exp, "html")
  }

  htmlUpdater (node, value) {
    node.innerHTML = value;
  }

  textUpdater (node, value) {
    node.textContent = value;
  }

  // 事件处理器
  eventHandle (node, vm, exp, dir) {
    // @click="onclick"
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }

  isDirective (attrName) {
    return attrName.indexOf('j-') === 0;
  }

  isEvent (attrName) {
    return attrName.indexOf('@') === 0;
  }

  isElement (node) {
    return node.nodeType === 1;
  }

  // 插值文本
  isInterpolation (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}

/**
 * 彩蛋   1.vue编译过程是怎么样的    2.双向数据绑定的原理是什么
 *
 *    1.3w1h原则
 *      先回答什么是编译，vue写的这些模板，我们的html根本不识别，我们通过编译的过程可以进行依赖收集，进行依赖收集后
 *      我们就将我们data中的数据模型和视图之间产生了绑定关系，产生了依赖关系，以后如果模型发生变化的时候，我们就可以通知这些
 *      依赖的地方，让他们进行更新，这就是我们施行编译的目的。 我们把这些依赖全部编译以后，更新操作，我们就可以做到模型驱动
 *      视图的变化，这就是编译过程，这就是他的作用
 *
 *    2.编译的时候解析出v-model ，就和其他的指令一样。之后做操作一共又两件事情
 *        1.把v-model这个元素上增加事件监听，将指定的事件的回调函数作为input事件的回调函数
 *        2.去监听，如果input发生变化的时候，我们就可以把最新的值设置到vue实例上，因为vue实例上，
 *        因为vue实例已经实现了数据响应化，他响应化的set函数会触发界面所有依赖的更新，所以界面跟这个数据相关的视图就更新了
 */