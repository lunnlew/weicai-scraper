import { proxyAct, jobAct } from '@/api/source'

const state = {
  list: [],
  boolSwitchJob: false,
  boolSwitchProxy: false,
  uniacclist: []
}

const mutations = {
  updateListItem(state, data) {
    if (data.type == 'update' || data.type == 'append') {
      let e = state.list.filter((item) => item.msg_sn == data.data.msg_sn)
      console.log(e)
      if (!e || !e.length) {
        console.log('data append')
        state.list.unshift(data.data)
      } else {
        console.log('data update')
      }
    }
    console.log(data)
  },
  updateList(state, data) {
    state.list = data
  },
  updateUniaccList(state, data) {
    state.uniacclist = data
  },
  // 由于Job任务会访问网络,所以proxy与job只能同时启动其中一个
  switchJob(state, enable) {
    if (enable) {
      state.boolSwitchProxy = !enable;
    }
    state.boolSwitchJob = enable;
  },
  switchProxy(state, enable) {
    if (enable) {
      state.boolSwitchJob = !enable;
    }
    state.boolSwitchProxy = enable;
  }
}

const actions = {
  updateUniaccList({ commit }, data) {
    commit('updateUniaccList', data)
  },
  updateListItem({ commit }, data) {
    commit('updateListItem', data)
  },
  updateList({ commit }, data) {
    commit('updateList', data)
  },
  switchJob({ commit }, enable) {
    if (enable) {
      proxyAct({
        'act': 'close'
      }).then(result => {})
    }
    jobAct({
      'act': enable ? 'start' : 'close'
    }).then(result => {})
    commit('switchJob', enable)
  },
  switchProxy({ commit }, enable) {
    if (enable) {
      jobAct({
        'act': 'close'
      }).then(result => {})
    }
    proxyAct({
      'act': enable ? 'start' : 'close'
    }).then(result => {})
    commit('switchProxy', enable)
  }
}

export default {
  state,
  mutations,
  actions
}
