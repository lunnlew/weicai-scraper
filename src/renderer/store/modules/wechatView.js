import { wechatAct } from '@/api/source'

const state = {
  list: [],
  loadingOpen: false
}

const mutations = {
  updateWechatList(state, data) {
    state.list = [
      data,
      ...state.list.filter(element => element.WeChatHelperName !== data.WeChatHelperName)
    ]
  },
  removeWechatItem(state, data) {
    state.list = state.list.filter(element => element.WeChatHelperName !== data.WeChatHelperName)
  },
  newWechatState(state, data) {
    state.loadingOpen = !state.loadingOpen
  },
  closeWechat(state, data) {
    state.list.splice(data.index, 1);
  },
  closeAllWechat(state, data) {
    state.list = [];
  }
}

const actions = {
  wechatRegister({ commit }, data) {
    if (data.Act == 'RegisterWeChatHelper') {
      commit('updateWechatList', data)
    } else {
      commit('removeWechatItem', data)
    }
  },
  newWechat({ commit }, data) {
    commit('newWechatState', data)
    wechatAct({
      'act': 'newWechat'
    }).then(result => {
      commit('newWechatState', data)
    })
  },
  closeAllWechat({ commit }, data) {
    wechatAct({
      'act': 'closeAllWechat'
    }).then(result => {
      commit('closeAllWechat', data)
    })
  },
  closeWechat({ commit }, data) {
    wechatAct({
      'act': 'closeWechat',
      'ProcessId': data.row.ProcessId
    }).then(result => {
      if (result.code == 200) {
        commit('closeWechat', data)
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}
