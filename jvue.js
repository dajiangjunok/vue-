// new JVue ({data:{...}})
class JVue {
  constructor(options) {
    this.$options = options;

    // 数据响应化
    this.$data = options.data;
    this.observe(this.$data);

    // // 模拟watcher创建
    // new Watcher();
    // this.$data.name;
    // new Watcher();
    // this.$data.foo.bar;

    new Compile(options.el, this);
    // created 执行
    if (options.created) {
      options.created.call(this)
    }
  }

  observe (val) {
    if (!val || typeof val !== 'object') {
      return;
    }

    Object.keys(val).forEach(key => {
      // 定义响应式
      this.defineReactive(val, key, val[key]);

      // 代理data中的属性到vue实例上
      this.proxyData(key);
    })
  }

  // 数据响应化
  defineReactive (dataObj, key, val) {
    this.observe(val) // 递归解决数据嵌套

    const dep = new Dep();

    Object.defineProperty(dataObj, key, {
      get () {
        Dep.target && dep.addDep(Dep.target)
        return val;
      },
      set (newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // console.log(`${key}值发生了变化，该值所在地方需要发生更新:${val}`);
        dep.notify();
      }
    })
  }

  proxyData (key) {
    Object.defineProperty(this, key, {
      get () {
        return this.$data[key];
      },
      set (newVal) {
        this.$data[key] = newVal;
      }
    })
  }
}

// Dep 用来管理watcher 
class Dep {
  constructor() {
    // 这里存放若干依赖（watcher），一个watcher对应一个属性
    this.deps = [];
  }

  addDep (dep) {
    this.deps.push(dep);
  }

  notify () {
    this.deps.forEach(dep => dep.update())
  }
}

// Watcher
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    // 将当前watcher实例指定到Dep静态属性 target
    Dep.target = this;

    this.vm[this.key]; // 出发getter,添加依赖
    Dep.target = null;
  }

  update () {
    // console.log('属性更新了');
    this.cb.call(this.vm, this.vm[this.key]);
  }
}