// 大小转换
var renderSize = function(filesize) {
  if (null == filesize || filesize == '' || !filesize) {
    return "0 Bytes";
  }
  var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
  var index = 0;
  var srcsize = parseFloat(filesize);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  var size = srcsize / Math.pow(1024, index);
  if (size % 1 === 0) {
    size = size.toFixed(0);
  } else {
    size = size.toFixed(2);
  }
  return size + unitArr[index];
}

module.exports = {
  renderSize
}
