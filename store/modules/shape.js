
import Parse from 'parse'
import _ from 'lodash'

const ShapeClass = Parse.Object.extend('shape')

const state = () => ({
  objects: [],
  list: []
})

// getters
const getters = {
  list: (state) => state.list
}

const actions = {
  search({ state }, filter) {
    var functionName = 'shapesWithCategory'

    if (!_.isEmpty(filter.organization)) {
      functionName = 'shapesForCategory'
    }

    return Parse.Cloud.run(functionName, filter)
  },

  async getList({ commit, state }, filter) {
    var list = await dispatch('search', filter)

    commit('SET_LIST', list)

    return list
  }
}


// mutations
const mutations = {
  SET_LIST(state, list) {
    state.list = list
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}