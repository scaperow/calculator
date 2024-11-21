import Go from 'gojs'
import Parse from 'parse'
import _ from 'lodash'

const StyleClass = Parse.Object.extend('style')

const state = () => ({
  predefine: null,
  current: null,
  list: [],
  objects: []
})

// getters
const getters = {
  predefine: (state) => state.predefine,
  current: (state) => state.current,
  list: (state) => state.list,
  objects: (state) => state.objects
}

const actions = {
  async getList ({ commit, state, dispatch }) {
    var list = []

    if (_.isEmpty(state.list)) {
      list = await new Parse.Query(StyleClass).find()

      commit('SET_LIST', list)
    }

    dispatch('getPredefine')

    return state.list
  },

  async getPredefine ({ commit, state, dispatch }) {
    var list = state.list
    var predefine = null

    if (_.isEmpty(list)) {
      list = await dispatch('getList')
    }

    predefine = _.find(list, (item) => item.isDefault === true)

    commit('SET_PREDEFINE', predefine)

    return predefine
  },

  async create ({ commit }, { name, model, isDefault }) {
    var style = new StyleClass()
    style.set('name', name)
    style.set('model', model)
    style.set('isDefault', isDefault)

    await style.save()
    commit('CREATE', style)

    return style.toJSON()
  },

  async update ({ commit, state }, { id, name, model, isDefault }) {
    let object = _.find(state.objects, { id: id })

    if (object) {
      object.set('name', name)
      object.set('model', model)
      object.set('isDefault', isDefault)

      await object.save()
    }

    //state.objects.splice(_.indexOf(state.objects, { id }), 1, object)
    commit('SET_LIST', state.objects)
  },

  async remove ({ commit, state }, id) {
    let style = _.find(state.list, { id: id })

    if (style) {
      var list = _.reject(state.list, (style) => style && style.id === id)
      commit('SET_LIST', list)

      await style.destroy()
    }
  }
}


// mutations
const mutations = {
  SET_PREDEFINE (state, predefine) {
    state.predefine = predefine
  },

  SET_LIST (state, list) {
    state.objects = list
    state.list = _.map(list, item => item.toJSON())
  },

  CREATE (state, style) {
    state.list.push(style)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}