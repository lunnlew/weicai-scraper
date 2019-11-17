const state = {
  mainView: 'ListView',
  mainViewData: null,
  updateSidebarViewVer: 1
}

const mutations = {
  changeMainView(state, opt) {
    state.mainView = opt.view
    state.mainViewData = opt.data
  },
  updateSidebarView(state, opt) {
    state.updateSidebarViewVer += 1
  }
}

const actions = {
  changeMainView({ commit, dispatch }, opt) {
    commit('changeMainView', opt)
  },
  updateSidebarView({ commit }, opt) {
    commit('updateSidebarView', opt)
  }
}

export default {
  state,
  mutations,
  actions
}
