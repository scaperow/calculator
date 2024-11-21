import Go from 'gojs'
import Parse from 'parse'
import _ from 'lodash'

const Organization = Parse.Object.extend('organization')
const Shape = Parse.Object.extend('shape')


const state = () => ({
    predefine: null,
    categories: [],
    categoryObjects: [],
    list: [],
    objects: []
})

// getters
const getters = {
    categories: (state) => state.categories,
    list: (state) => state.list,
    objects: (state) => state.objects
}

const actions = {
    async getList({ commit, state, dispatch }, organization) {

        var categories = []
        var list = []

        if (!_.isEmpty(organization) && !_.isEmpty(state.categories)) {
            list = await new Parse.Query(Shape).equalTo('organization', _.find(state.categoryObjects, { id: organization })).find()
            commit('SET_LIST', list)
        } else {
            if (_.isEmpty(state.list)) {
                categories = await new Parse.Query(Organization).equalTo('category', '图标').find()
                commit('SET_CATEGORIES', categories)
            }

            if (_.isEmpty(categories)) {
                commit('SET_LIST', [])
            } else {
                list = await new Parse.Query(Shape).equalTo('organization', _.first(categories)).find()
                commit('SET_LIST', list)
            }
        }

        return {
            categories,
            list
        }
    },

    async createMany({ commit, state }, arrayData) {
        var models = _.map(arrayData, ({ name, text, organization }) => {
            var model = new Shape()
            model.set('name', name)
            model.set('model', { text, category: 'FontIcon' })
            model.set('category', 'FontIcon')
            model.set('organization', _.find(state.categoryObjects, { id: organization }))

            return model
        })

        await Parse.Object.saveAll(models)

        state.objects.push(...models)
        commit('SET_LIST', state.objects)
    },

    async create({ commit, state }, { name, text, organization }) {
        var model = new Shape()
        model.set('name', name)
        model.set('model', { text })
        model.set('organization', _.find(state.categoryObjects, { id: organization }))

        await style.save()

        state.objects.push(model)
        commit('SET_LIST', state.objects)

        return model.toJSON()
    },

    async update({ commit, state }, { id, name, model, isDefault }) {
        let object = _.find(state.objects, { id: id })

        if (object) {
            object.set('name', name)
            object.set('model', { text })
            object.set('organization', organization)

            await object.save()
        }

        //state.objects.splice(_.indexOf(state.objects, { id }), 1, object)
        commit('SET_LIST', state.objects)
    },

    async remove({ commit, state }, id) {
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
    SET_PREDEFINE(state, predefine) {
        state.predefine = predefine
    },

    SET_LIST(state, list) {
        state.objects = list
        state.list = _.map(list, item => item.toJSON())
    },

    SET_CATEGORIES(state, list) {
        state.categoryObjects = list
        state.categories = _.map(list, item => item.toJSON())
    },

    CREATE(state, model) {
        state.list.push(model)
    },

    CREATEMANY(state, model) {
        state.list.push(model)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}