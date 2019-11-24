import { articleDelete, uniaccDelete, proxyAct, jobAct } from '@/api/source'

const state = {
  list: [],
  boolSwitchJob: false,
  boolSwitchProxy: false,
  uniacclist: []
}

const mutations = {
  updateListItem(state, data) {
    if (data.type == 'update' || data.type == 'append') {
      state.list = [
        data.data,
        ...state.list.filter(element => element.msg_sn !== data.data.msg_sn)
      ]
    }
    console.log(data)
  },
  updateList(state, data) {
    state.list = data
  },
  deleteArticle(state, data) {
    state.list.splice(data.index, 1);
  },
  deleteUniacc(state, data) {
    state.uniacclist.splice(data.index, 1);
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
  deleteUniacc({ commit }, data) {
    uniaccDelete({
      act: 'delete',
      '_id': data.row._id
    }).then(result => {})
    commit('deleteUniacc', data)
  },
  deleteArticle({ commit }, data) {
    articleDelete({
      act: 'delete',
      '_id': data.row._id
    }).then(result => {})
    commit('deleteArticle', data)
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
