import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

if (process.env.IS_ELECTRON) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

var socket = new WebSocket('ws://localhost:6877/weicai/wcclient');
socket.addEventListener('open', function(event) {
  console.log('socket is open')
});
socket.addEventListener('message', function(event) {
  console.log('Message from server', event.data);
  var data = JSON.parse(event.data)
  if (data.type == 'update' || data.type == 'append') {
    store.dispatch('updateListItem', data)
  }
  if (data.type == 'toggleMakeImg') {
    store.dispatch('toggleMakeImg', data.data)
  }
  if (data.type == 'export_status') {
    store.dispatch('toggleLoading', data.data)
  }
  if (data.type == 'wechatRegister') {
    store.dispatch('wechatRegister', data.data)
  }
  if (data.type == 'NotSupportedWechatVersion') {
    store.dispatch('NotSupportedWechatVersion', data.data)
  }
});


import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

Vue.use(ViewUI)


// global filters
import * as filters from './filters'
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
