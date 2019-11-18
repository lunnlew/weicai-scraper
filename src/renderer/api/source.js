import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/article',
    method: 'post',
    params
  })
}

export function fetchDetail(params) {
  return request({
    url: '/article',
    method: 'post',
    params
  })
}

export function fetchSetting(params) {
  return request({
    url: '/setting',
    method: 'post',
    params
  })
}

export function saveSetting(params, data) {
  return request({
    url: '/setting',
    method: 'post',
    params,
    data
  })
}

export function proxyAct(params) {
  return request({
    url: '/proxy',
    method: 'post',
    params
  })
}

export function jobAct(params) {
  return request({
    url: '/job',
    method: 'post',
    params
  })
}
