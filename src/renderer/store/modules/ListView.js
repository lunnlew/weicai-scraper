const state = {
  list: []
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
  }
}

const actions = {
  updateListItem({ commit }, data) {
    commit('updateListItem', data)
  },
  updateList({ commit }, data) {
    commit('updateList', data)
  }
}

export default {
  state,
  mutations,
  actions
}
