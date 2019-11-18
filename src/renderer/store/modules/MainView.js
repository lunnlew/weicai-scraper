const state = {
  mainView: 'SettingView',
  mainViewData: null
}

const mutations = {
  changeMainView(state, opt) {
    state.mainView = opt.view
    state.mainViewData = opt.data
  }
}

const actions = {
  changeMainView({ commit, dispatch }, opt) {
    commit('changeMainView', opt)
  }
}

export default {
  state,
  mutations,
  actions
}
