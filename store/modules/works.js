


import Parse from 'parse'
import Http from '~/api/common'
const WorksClass = Parse.Object.extend('works')
const ShareClass = Parse.Object.extend('share')
const Works = Http.create('works')
const asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
const state = () => ({
  // mineList: [],
  // shareList: [],
  // teamList: [],
  // recycleList: [],
  // mineObjects: [],
  // shareObjects: [],
  // teamObjects: []
  list: [],
  objects: [],
  searchObjects: [],
  searchList: [],
  folderObjects: [],
  folderList: [],
  folder: null
})

const processList = function (objectList) {
  return _.chain(objectList)
    .map(item => item.toJSON())
    .orderBy(['updatedAt'], ['desc'])
    .map(item => {
      item.isShare = _.get(item, 'share.shareWithLink') === true || _.get(item, 'share.shareWithMedia') === true || _.get(item, 'share.shareWithPicture') === true
      return item
    })
    .value()
}

const getWorksFilter = function (userId, folderId, columns = []) {
  return new Parse.Query(WorksClass)
    .doesNotExist('isDelete')
    .doesNotExist('isFolder')
    .equalTo('parentId', folderId)
    .include('style')
    .include('share')
}

// getters
const getters = {
  // mineList: (state) => state.mineList,
  // shareList: (state) => state.shareList,
  // shareList: (state) => state.shareList
  list: (state) => state.list,
  searchList: (state) => state.searchList,
  folders: (state) => state.folderList,
  folder: (state) => state.folder
}

const actions = {
  async setFolder({ commit, state, dispatch }, folderId) {
    var folder = _.find(state.folderObjects, { id: folderId })
    dispatch('works/getMineList', { folderId })
    commit('SET_FOLDER', folder)
  },
  async getFolders({ commit, state, dispatch }) {
    var list = await new Parse.Query(WorksClass)
      .equalTo('isFolder', true)
      .doesNotExist('isDelete')
      .find()


    commit('SET_FOLDERS', list)
  },
  async getMineList({ commit, state, dispatch }, { folderId = null } = {}) {
    var user = await dispatch('user/getUser', null, { root: true })
    var list = await new Parse.Query(WorksClass)
      .doesNotExist('isDelete')
      .doesNotExist('isFolder')
      .equalTo('parentId', folderId)
      .include('style')
      .include('share')
      .find()

    commit('SET_FOLDER', _.find(state.folderObjects, { id: folderId }))
    commit('SET_LIST', list)
  },
  async getShareList({ commit, state, dispatch }, { folder = null } = {}) {
    var user = await dispatch('user/getUser', null, { root: true })

    var shareFilter =
      Parse.Query.or(
        new Parse.Query(ShareClass).equalTo('shareWithPicture', true),
        new Parse.Query(ShareClass).equalTo('shareWithMedia', true),
        new Parse.Query(ShareClass).equalTo('shareWithLink', true))

    var worksFilter = getWorksFilter(user.objectId, folder)
      .matchesKeyInQuery('objectId', 'source', shareFilter)

    // var worksFilter = getWorksFilter(user.objectId, folder)

    // var shareFilter = Parse.Query.or(
    //   new Parse.Query(WorksClass).equalTo('share.shareWithPicture', true),
    //   new Parse.Query(WorksClass).equalTo('share.shareWithMedia', true),
    //   new Parse.Query(WorksClass).equalTo('share.shareWithLink', true))

    // var filter = Parse.Query.and(worksFilter, shareFilter)
    commit('SET_LIST', await worksFilter.find())
  },
  async getTeamList({ commit, dispatch }, { folder } = {}) {
    var user = await dispatch('user/getUser', null, { root: true })

    //commit('SET_TEAMLIST', await getWorksFilter(user.objectId, folder).find())
    commit('SET_LIST', await getWorksFilter(user.objectId, folder).find())
  },

  async getRecycleList({ commit, dispatch }, { folder = null } = {}) {
    var user = await dispatch('user/getUser', null, { root: true })

    var filter = new Parse.Query(WorksClass)
      .equalTo('isDelete', true)
      .doesNotExist('isFolder')

    commit('SET_LIST', await filter.find())
  },
  async search({ commit, dispatch }, { keyword, folder } = {}) {
    var user = await dispatch('user/getUser', null, { root: true })

    var filter = new Parse.Query(WorksClass)


    if (folder) {
      filter = filter.equalTo('parent', folder)
    }

    if (keyword) {
      filter = filter.contains('name', keyword)
    }

    commit('SET_LIST', await filter.find())
  },
  async create({ commit }, model) {
    try {
      var works = await Works.save(model)

      if (model.isFolder) {
        state.folderObjects.splice(0, 0, works)
        commit('SET_FOLDERS', state.folderObjects)
      } else {
        state.objects.splice(0, 0, works)
        commit('SET_LIST', state.objects)
      }

      return works
    } catch (error) {
      throw error
    }
  },
  async update({ state, commit }, object) {
    var works = _.find(state.objects, { id: object.id || object.objectId })
    var index = _.indexOf(state.objects, works)

    if (works) {
      var newly = await Works.update(works, object)
      var list = state.objects

      list.splice(index, 1, newly)

      commit('SET_LIST', list)
    }
  },
  async get({ state }, { fromCache = true, id }) {
    var filter = { objectId: id }

    if (fromCache) {
      return _.find(state.list, filter)
    } else {
      var works = await WorksApi.get(id)

      return works.toJSON()
    }
  },
  async recovery({ state, commit, dispatch }, id) {
    var list = state.objects
    var ids = id instanceof Array ? id : [id]

    await asyncForEach(ids, async id => {
      var model = _.find(list, { id })
      var index = _.indexOf(list, model)

      model.unset('isDelete')
      await model.save()

      list.splice(index, 1)
    })

    commit('SET_LIST', list)
  },
  async removeFolder({ state, commit }, id) {
    var list = state.folderObjects
    var ids = id instanceof Array ? id : [id]

    await asyncForEach(ids, async id => {
      var model = _.find(list, { id })
      var index = _.indexOf(list, model)

      if (model.has('isDelete')) {
        // physics delete
        await model.destroy()
      } else {
        // logic delete
        model.set('isDelete', true)
        await model.save()
      }

      list.splice(index, 1)
    })

    commit('SET_FOLDERS', list)
  },
  async remove({ state, commit }, id) {
    var list = state.objects
    var ids = id instanceof Array ? id : [id]

    await asyncForEach(ids, async id => {
      var model = _.find(list, { id })
      var index = _.indexOf(list, model)

      if (model.has('isDelete')) {
        // physics delete
        await model.destroy()
      } else {
        // logic delete
        model.set('isDelete', true)
        await model.save()
      }

      list.splice(index, 1)
    })

    commit('SET_LIST', list)
  },
  async move({ state, commit }, { folderId, fileId }) {
    var isOtherFolder = false
    var file = _.find(state.objects, { id: fileId })
    var index = _.findIndex(state.objects, { id: fileId })

    if (file) {
      isOtherFolder = file.get('parentId') !== folderId

      file.set('parentId', folderId)
      await file.save()

      if (isOtherFolder) {
        state.objects.splice(index, 1)
        commit('SET_LIST', state.objects)
      }
    }
  },
  async copy({ state, commit }, { folderIds, fileId }) {
    var file = _.find(state.objects, { id: fileId })
    var fileModel = null
    var sameFolder = []
    if (file) {
      await asyncForEach(folderIds, async (folderId) => {
        fileModel = file.clone()
        fileModel.set('parentId', folderId)
        //fileModel.set('name', file.get('name') + '(复制)')
        await fileModel.save()

        if (folderId === (file.get('parentId') || null)) {
          sameFolder.push(fileModel)
        }
      })

      state.objects = [...state.objects, ...sameFolder]
      commit('SET_LIST', state.objects)
    }
  }
}

// mutations
const mutations = {
  SET_LIST(state, list) {
    state.objects = list
    state.list = processList(list)
  },
  SET_SEARCH_LIST(state, list) {
    state.searchObjects = list
    state.searchList = processList(list)
  },
  SET_FOLDERS(state, list) {
    state.folderObjects = list
    state.folderList = _.map(list, item => item.toJSON())
  },
  SET_FOLDER(state, folder) {
    state.folder = folder.toJSON()
  }

  // SET_MINELIST (state, list) {
  //   state.mineObjects = list
  //   state.mineList = processList(list)
  // },

  // SET_SHARELIST (state, list) {
  //   state.shareObjects = list
  //   state.shareList = processList(list)
  // },

  // SET_TEAMLIST (state, list) {
  //   state.teamObjects = list
  //   state.teamList = processList(list)
  // }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}