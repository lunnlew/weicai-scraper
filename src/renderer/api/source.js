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

export function articleDelete(params) {
  return request({
    url: '/article',
    method: 'post',
    params
  })
}

export function uniaccDelete(params) {
  return request({
    url: '/uniacc',
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


export function fetchUniaccList(params) {
  return request({
    url: '/uniacc',
    method: 'post',
    params
  })
}

export function fetchUniaccDetail(params) {
  return request({
    url: '/uniacc',
    method: 'post',
    params
  })
}

export function scraperAction(params) {
  return request({
    url: '/scraper',
    method: 'post',
    params
  })
}
