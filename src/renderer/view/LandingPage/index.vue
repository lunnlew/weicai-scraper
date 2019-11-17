<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          欢迎使用微采助手
        </span>
        <system-information></system-information>
      </div>
      <div class="right-side">
        <div class="doc">
          <div class="title">能做什么?</div>
          <p>
            微采助手能够帮助您管理您的公众号采集数据。
          </p>
          <button @click="navigationTo('/Main')">开始管理</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">支持的功能</div>
          <button class="alt">公众号历史文章采集</button>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
import SystemInformation from '@/components/LandingPage/SystemInformation'

export default {
  name: 'landing-page',
  components: { SystemInformation },
  methods: {
    navigationTo(link) {
      let target = {
        view: 'ListView',
        data: {}
      }
      this.$store.dispatch('changeMainView', target)
      // this.$store.dispatch('changeStyle', {'style': 'background-default'})
      this.$router.push(link).catch(err => { console.log(err) })
    }
  }
}

</script>
<style lang="less" scoped>
#wrapper {
  background: radial-gradient(ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, .9) 100%);
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;

  &>div {
    flex-basis: 50%;
  }
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;

  &.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }
}

p {
  color: black;
  margin-bottom: 10px;
}

button {
  font-size: .8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}

.button .alt {
  color: #42b983;
  background-color: transparent;
}

</style>
