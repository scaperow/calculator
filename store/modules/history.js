
import Parse from 'parse'
import _ from 'lodash'

const HistoryClass = Parse.Object.extend('history')

const state = () => ({
  current: null,
  currentObject: null,

  objects: [],
  list: []
})

// getters
const getters = {
  list: (state) => state.list,
  current: (state) => state.current
}

const actions = {
  async getList ({ commit, state, dispatch }, { works }) {
    var list = await new Parse.Query(HistoryClass).equalTo('works', {
      "__type": "Pointer",
      "className": "works",
      "objectId": works
    }).exclude('raw').find()

    commit('SET_LIST', list)

    return state.list
  },
  async setCurrent ({ commit, state }, id) {
    var model = _.find(state.objects, { id })

    if (model && !model.has('raw')) {
      await model.fetchWithInclude('raw')
      commit('SET_LIST', state.objects)
    }

    commit('SET_CURRENT', id)

    return state.current
  },

  async remove ({ commit, state }, id) {
    var model = _.find(state.objects, { id })
    var index = _.indexOf(state.objects, model)

    if (model) {
      await model.destroy()

      state.objects.splice(index, 1)
      commit('SET_LIST', state.objects)
      commit('SET_CURRENT', null)
    }
  }
}


// mutations
const mutations = {
  SET_LIST (state, list) {
    state.objects = list
    state.list = _.map(list, item => item.toJSON())
  },
  SET_CURRENT (state, id) {
    state.current = _.find(state.list, { objectId: id })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}