import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import axios from 'axios'
import { Message } from 'element-ui'
import md5 from 'js-md5'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const hosturl = process.env.VUE_APP_HOST_URL + process.env.VUE_APP_LOGIN_URL

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      service.get(hosturl, {
        headers:
            {
              'content-type': 'application/json'
            },
        params:
            {
              'username': username,
              'password': md5(password)
            }
      }).then(response => {
        console.log(response)
        if (response.data.code !== 200) {
          Message({
            message: 'Account and password are incorrect.',
            type: 'error',
            duration: 5 * 1000
          })
          resolve()
          return
        }
        const { result } = response.data
        commit('SET_TOKEN', result.token)
        setToken(result.token)

        const { title, cover } = result.user
        commit('SET_NAME', title)
        commit('SET_AVATAR', cover)

        resolve(result)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // getInfo(state.token).then(response => {
      service.get(process.env.VUE_APP_HOST_URL + '/user/info',
        {
          headers:
            {
              'content-type': 'application/json',
              'X-Token': getToken()
            }
        }).then(response => {
        // console.log(response)
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { user } = data.result
        const { title, cover } = user

        commit('SET_NAME', title)
        commit('SET_AVATAR', cover)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

