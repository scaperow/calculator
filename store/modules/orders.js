
import Parse from 'parse'
import _ from 'lodash'
import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from 'constants'

const OrderClass = Parse.Object.extend('order')

const state = () => ({
    categoryObjects: [],
    categoryList: [],
    objects: [],
    list: []
})

// getters
const getters = {
    list: (state) => state.list,
}

const actions = {
    async getList({ state, commit }, { customerId }) {
        var objects = await new Parse.Query(OrderClass).equalTo('customerId', customerId).find()
        commit('SET_LIST', objects)
    },
    async add({ state, commit }, model) {
        var object = new OrderClass()
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
    async removeItem({ state, commit }, orderId, itemIndex) {
        var object = _.find(state.objects, { id: orderId })
        var index = _.indexOf(state.objects, { id: orderId })
        var items = object.get('items')
        items.splice(itemIndex, 1)
        object.set('items', items)
        state.objects.splice(index, 1, object)
        commit('SET_LIST', state.objects)
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