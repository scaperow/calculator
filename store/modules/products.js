
import Parse from 'parse'
import _ from 'lodash'

const ProductClass = Parse.Object.extend('product')
const CategoryClass = Parse.Object.extend('productCategory')

const state = () => ({
    categoryObjects: [],
    categoryList: [],
    objects: [],
    list: []
})

// getters
const getters = {
    list: (state) => state.list,
    categoryList: (state) => state.categoryList
}

const actions = {
    async getList({ state, commit }, filter) {
        var objects = await new Parse.Query(ProductClass).find()
        commit('SET_LIST', objects)
    },
    async getCategoryList({ state, commit }) {
        var objects = await new Parse.Query(CategoryClass).find()
        commit('SET_CATEGORY_LIST', objects)
    },
    async addCategory({ state, commit }, model) {
        var object = new CategoryClass()
        _.each(model, (value, key) => {
            object.set(key, value)
        })

        object = await object.save()
        state.categoryObjects.push(object)
        commit('SET_CATEGORY_LIST', state.categoryObjects)
    },
    async add({ state, commit }, model) {
        var object = new ProductClass()
        _.each(model, (value, key) => {
            object.set(key, value)
        })

        object = await object.save()
        state.objects.push(object)
        commit('SET_LIST', state.objects)
    },
    async update({ state, commit }, model) {

        var object = _.find(state.objects, { id: model.objectId })
        var index = _.indexOf(state.objects, { id: model.objectId })

        _.each(model, (value, key) => {
            object.set(key, value)
        })

        await object.save()
        state.objects.splice(index, 1, object)
        commit('SET_LIST', state.objects)
    },
    async removeCategory({ state, commit }, id) {
        var object = _.find(state.categoryObjects, { id })
        var index = _.indexOf(state.categoryObjects, { id })

        await object.destroy()
        state.categoryObjects.splice(index, 1)
        commit('SET_CATEGORY_LIST', state.categoryObjects)
    },
    async remove({ state, commit }, id) {
        var object = _.find(state.objects, { id })
        var index = _.indexOf(state.objects, { id })

        await object.destroy()
        state.objects.splice(index, 1)
        commit('SET_LIST', state.objects)
    },
    async setCalculatePrice({ state, commit }, { objectId, price }) {

        var object = _.find(state.objects, { id: objectId })
        var index = _.findIndex(state.objects, { id: objectId })


        if (object) {
            object.set('price', price)
            state.objects.splice(index, 1, object)
            commit('SET_LIST', state.objects)
        }
    },
    async setCategoryCalculatePrice({ state, commit }, { objectId, price }) {
        var object = _.find(state.categoryObjects, { id: objectId })
        var index = _.findIndex(state.categoryObjects, { id: objectId })
  
        if (object) {
            object.set('price', price)
            state.categoryObjects.splice(index, 1, object)
            commit('SET_CATEGORY_LIST', state.categoryObjects)
        }
    }
}


// mutations
const mutations = {
    SET_LIST(state, list) {
        state.objects = list
        state.list = _.map(list, item => item.toJSON())
    },

    SET_CATEGORY_LIST(state, list) {
        state.categoryObjects = list
        state.categoryList = _.map(list, item => item.toJSON())
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}