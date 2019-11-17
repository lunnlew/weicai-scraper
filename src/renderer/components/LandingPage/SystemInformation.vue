<template>
  <div>
    <div class="title">资料库总览</div>
    <div class="items">
      <div class="item">
        <div class="name">总公众号数:</div>
        <div class="value">0</div>
      </div>
      <div class="item">
        <div class="name">总文章数:</div>
        <div class="value">0</div>
      </div>
      <div class="item">
        <div class="name">占用总空间:</div>
        <div class="value">0</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      electron: process.versions.electron,
      name: this.$route.name,
      node: process.versions.node,
      path: this.$route.path,
      platform: require('os').platform(),
      vue: require('vue/package.json').version
    }
  }
}

</script>
<style lang="less" scoped>
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: .25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  margin-bottom: 6px;

  .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .value {
    color: #35495e;
    font-weight: bold;
  }
}

</style>
