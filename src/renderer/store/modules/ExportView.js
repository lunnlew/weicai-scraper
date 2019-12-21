const state = {
  loading: false
}

const mutations = {
  toggleLoading(state, data) {
    console.log(data)
    state.loading = !state.loading;
  }
}

const actions = {
  toggleLoading({ commit }, data) {
    commit('toggleLoading', data)
  }
}

export default {
  state,
  mutations,
  actions
}
