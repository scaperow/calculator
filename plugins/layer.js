// import Confirm from './confirm.vue'
// import Message from './message.vue';
import Vue from 'vue'
const colors = ['success', 'info', 'warning', 'error'];

function Install (Vue, options = { confirmOptions: {}, messageOptions: {} }) {
  const container = document.querySelector('[data-app=true]') || document.body

  function createDialogCmp (opts) {
    var promise = new Promise((resolve, reject) => {
      const cmp = new Vue(Confirm);
      Object.assign(cmp, Vue.prototype.$confirm.options || {}, { ...opts, resolve, reject });
      // container.appendChild(cmp.$mount().$el)
      console.log(cmp.$mount().$el)
    })

    return promise
  }

  function createMessageCmp (opts) {
    const cmp = new Vue(Message);
    Object.assign(cmp, Vue.prototype.$message.options || {}, opts);
    container.appendChild(cmp.$mount().$el);
    cmp.open();
    return cmp.$el;
  }

  function confirm (message, options = {}) {
    options.message = message
    return createDialogCmp(options)
  }

  function message (opts) {
    return createMessageCmp(opts);
  }



  Vue.prototype.$confirm = confirm
  Vue.prototype.$confirm.options = options.confirmOptions || {}

  Vue.prototype.$message = message
  Vue.prototype.$message.options = options.messageOptions || {}


}

// Vue.use(Vuetify)
// Install(Vue, Vue.prototype.$layer)



export default ({ app }, inject) => {

  Vue.prototype.$prompt = function (message, title, options) {
    return app.store.dispatch('overlay/prompt', {
      message, title, ...options
    })
  }

  Vue.prototype.$confirm = function (message, title, options) {
    return app.store.dispatch('overlay/confirm', {
      message, title, ...options
    })
  }

  Vue.prototype.$message = function (message, options) {
    return app.store.dispatch('overlay/message', {
      message, ...options
    })
  }

  colors.forEach((color) => {
    Vue.prototype.$message[color] = (message, options) => Vue.prototype.$message(message, { ...options, color })
  })

  Vue.prototype.$waiting = function (isWaiting = true, { message = '加载中' } = {}) {
    return app.store.dispatch('overlay/waiting', {
      isWaiting, message
    })
  }
}