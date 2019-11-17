<template>
  <div>
    <div class="MainContainer">
      <div class="background-container">
        <div style="position: absolute; width: 100%; height: 100%;">
        </div>
        <div class="background1"></div>
      </div>
      <sidebar-container></sidebar-container>
      <page-container :mainView="mainView"></page-container>
    </div>
  </div>
</template>
<script>
import SidebarContainer from '@/components/SidebarContainer'
import PageContainer from '@/components/PageContainer'
export default {
  name: 'MainContainer',
  components: { SidebarContainer, PageContainer },
  data: () => {
    return {
      componentData: null,
      dialogComponent: null
    }
  },
  watch: {},
  methods: {},
  computed: {
    mainView() {
      return this.$store.state.MainView.mainView
    }
  },
  mounted() {}
}

</script>
<style lang="less" scoped>
.MainContainer {
  font-size: 13px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.background-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background-color: #3f4245;
}

.background1 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url(~@/assets/bg1.png);
  z-index: 2;
}

.background-default {
  position: absolute;
  animation-duration: 600ms;
  background: url(~@/assets/bg2.png);
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

.background-style2 {
  position: absolute;
  animation-duration: 600ms;
  background: url(~@/assets/bg3.jpg);
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

</style>
