
import Parse from 'parse'
import _ from 'lodash'

const CustomerClass = Parse.Object.extend('customers')

const state = () => ({
    categoryObjects: [],
    categoryList: [],
    objects: [],
    list: []
})

// getters
const getters = {
    list: (state) => state.list
}

const actions = {
    async getList({ state, commit }, filter) {
        var objects = await new Parse.Query(CustomerClass).find()
        commit('SET_LIST', objects)
    },
    async add({ state, commit }, model) {
        var object = new CustomerClass()
        _.each(model, (value, key) => {
            object.set(key, value)
        })

        object = await object.save()
        state.objects.push(object)
        commit('SET_LIST', state.objects)
    },
    async remove({ state, commit }, id) {
        var object = _.find(state.objects, { id })
        var index = _.indexOf(state.objects, { id })

        await object.destroy()
        state.objects.splice(index, 1)
        commit('SET_LIST', state.objects)
    },
    async update({ state, commit }, model) {
        var object = _.find(state.objects, { id: model.objectId })
        var index = _.indexOf(state.objects, { id: model.objectId })
        if (object) {
            _.each(model, (value, key) => {
                object.set(key, value)
            })

            await object.save()
            state.objects.splice(index, 1, object)
            commit('SET_LIST', state.objects)
        }
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