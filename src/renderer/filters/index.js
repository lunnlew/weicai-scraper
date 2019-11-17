String.prototype.startWith = function(str) {
  var reg = new RegExp('^' + str)
  return reg.test(this)
}

String.prototype.endWith = function(str) {
  var reg = new RegExp(str + '$')
  return reg.test(this)
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

export function fmtNum(t) {
  return t || 0
}

// 用于格式化时间串
export function fmtDate(t, fmt) {
  if (t == null) {
    return ''
  }
  var date = new Date(parseInt(t))
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str)
      )
    }
  }
  return fmt
}
