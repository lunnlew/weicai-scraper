<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft"></div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="Page">
        <Tabs value="name1">
          <TabPane label="代理设置" name="name1">
            <Form :label-width="80" style="width: 300px">
              <FormItem label="代理IP">
                {{setting.proxy_ip}}
              </FormItem>
              <FormItem label="代理端口">
                <Input placeholder="6879" v-model="setting.proxy_port"></Input>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="handleSubmit()">保存</Button>
              </FormItem>
            </Form>
          </TabPane>
          <TabPane label="采集设置" name="name2"></TabPane>
        </Tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { fetchSetting, saveSetting } from '@/api/source'

export default {
  name: 'SettingView',
  components: {},
  props: [],
  data: () => {
    return {
      setting: {
        proxy_ip: '127.0.0.1',
        proxy_port: '6879'
      }
    }
  },
  methods: {
    handleSubmit() {
      var that = this
      saveSetting({
        act: 'save'
      }, that.setting).then(result => {})
    },
    loadData() {
      var that = this
      fetchSetting({
        act: 'get'
      }).then(result => {
        that.setting = Object.assign(that.setting, result.data)
      })
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {},
  computed: {}
}

</script>
<style lang="less" scoped>
.ContainerView {
  font-size: 13px;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 25px;
  height: 60px;
  background-color: rgba(0, 0, 0, .15);
  color: hsla(0, 0%, 100%, .7);
  font-size: 15px;
  line-height: 60px;

  .tags span.label {
    padding: 0 9px;
    font-size: 14px;
  }
}

.pageHeaderLeft {
  display: flex;
  align-items: center;
  flex: 1 1 25%;
  overflow: hidden;
  height: 100%;
  white-space: nowrap;
  justify-content: flex-start;
}

.pageHeaderRight {
  display: flex;
  align-items: center;
  flex: 1 1 25%;
  overflow: hidden;
  height: 100%;
  white-space: nowrap;
  justify-content: flex-end;
}

.PageContent {
  position: relative;
  flex-grow: 1;
}


.PageScroller {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-color: hsla(0, 0%, 100%, .2) transparent;

  &::-webkit-scrollbar {
    width: 14px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    min-height: 50px;
    border: 3px solid transparent;
    border-radius: 8px;
    background-color: hsla(0, 0%, 100%, .2);
    background-clip: padding-box;

    &:hover {
      background-color: hsla(0, 0%, 100%, .3);
    }

    &:window-inactive {
      background-color: hsla(0, 0%, 100%, .05);
    }
  }
}


.Page {

  font-size: 13px;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  perspective: 500px;
  padding: 0px 30px 50px 30px;
  background-color: #fff;

}

</style>
