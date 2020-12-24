import request from '@/utils/request'

const hosturl = process.env.VUE_APP_HOST_URL + '/admin/article'

export function fetchList(query) {
  return request({
    url: hosturl + '/list',
    method: 'get',
    params: query
  })
}

export function fetchCreate(data) {
  return request({
    url: hosturl + '/add',
    method: 'post',
    data
  })
}

export function fetchUpdate(data) {
  return request({
    url: hosturl + '/update',
    method: 'post',
    data
  })
}
