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
  }
}

export default {
  state,
  mutations,
  actions
}
