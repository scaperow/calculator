

const state = () => ({
  messages: [],
  confirms: [],
  prompts: [],
  waiting: null
})

// getters
const getters = {
  messages: (state) => state.messages,
  confirms: (state) => state.confirms,
  prompts: (state) => state.prompts,
  waiting: (state) => state.waiting
}

const actions = {
  message ({ commit, state, dispatch }, option) {
    option.visible = true

    return commit('MESSAGE', option)
  },
  confirm ({ commit }, option) {
    option.visible = true

    var promise = new Promise((resolve, reject) => {
      commit('CONFIRM', {
        ...option,
        resolve,
        reject
      })
    })

    return promise
  },
  prompt ({ commit }, option) {
    option.visible = true

    var promise = new Promise((resolve, reject) => {
      commit('PROMPT', {
        ...option,
        resolve,
        reject
      })
    })

    return promise
  },
  waiting ({ commit }, option) {
    commit('WAITING', option)
  }
}


// mutations
const mutations = {
  MESSAGE (state, model) {
    state.messages.push(model)
  },
  CONFIRM (state, model) {
    state.confirms.push(model)
  },
  PROMPT (state, model) {
    state.prompts.push(model)
  },
  WAITING (state, model) {
    var { isWaiting } = model

    if (isWaiting) {
      state.waiting = model
    } else {
      state.waiting = null
    }

  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}