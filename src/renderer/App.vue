<template>
  <div id="app" class="application">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'weicai-scraper'
}

</script>
<style>
body {
  fill: currentColor;
  color: #eee;
}

a {
  color: #cc7b19;
}

a,
a:hover {
  text-decoration: none;
}

.application {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
}

</style>
