import { wechatAct } from '@/api/source'

const state = {
  list: []
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
  }
}

const actions = {
  wechatRegister({ commit }, data) {
    if (data.Act == 'RegisterWeChatHelper') {
      commit('updateWechatList', {
        "WeChatHelperName": data['WeChatHelperName']
      })
    } else {
      commit('removeWechatItem', {
        "WeChatHelperName": data['WeChatHelperName']
      })
    }
  }
}

export default {
  state,
  mutations,
  actions
}
