
import Parse from 'parse'
import _ from 'lodash'
import Http from '~/api/common'

const MapsClass = Parse.Object.extend('maps')
const Maps = Http.create('works')

const state = () => ({
  list: [],
  objects: [],
})

// getters
const getters = {
  list: (state) => state.list
}

const actions = {

  async update({ commit, state }, object) {
    var model = _.find(state.objects, { id: object.id || object.objectId })
    var index = _.indexOf(state.objects, model)

    if (model) {
      var newly = await Maps.update(model, object)

      state.objects.splice(index, 1, newly)

      commit('SET_LIST', state.objects)
    }
  },

  async getList({ commit, state }) {
    var list = []

    if (_.isEmpty(state.list)) {
      list = await new Parse.Query(MapsClass).
        equalTo('disabled', false)
        .find()

      commit('SET_LIST', list)
    }

    return list
  }
}

// mutations
const mutations = {
  SET_LIST(state, list) {
    state.objects = list
    state.list = _.map(list, item => item.toJSON())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}