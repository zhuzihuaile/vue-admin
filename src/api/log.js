import request from '@/utils/request'

const hosturl = 'http://192.168.0.244:8989/api-book/admin/article'

export function fetchList(query) {
  return request({
    url: hosturl + '/list',
    method: 'get',
    params: query
  })
}
