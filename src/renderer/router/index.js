import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'fullpage',
      component: require('@/view/LandingPage').default
    },
    {
      path: '/Main',
      name: 'Main',
      component: require('@/view/MainPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
