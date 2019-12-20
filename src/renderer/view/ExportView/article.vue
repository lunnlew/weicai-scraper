<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft"></div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
        <div class="Page">
          <Divider orientation="left">需要导出字段</Divider>
          <Tag type="dot" closable color="primary" v-for="item in keys" :key="item.field" :name="item.name" @on-close="handleCloseA">{{ item.name }}</Tag>
          <Divider orientation="left">备选导出字段</Divider>
          <Tag type="dot" closable color="default" v-for="item in keys_save" :key="item.field" :name="item.name" @on-close="handleCloseB">{{ item.name }}</Tag>
          <Divider orientation="left">导出方式</Divider>
          <Button type="primary" @click="clickExport('csv')">导出为CSV</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { articleAction } from '@/api/source'
export default {
  name: 'ExportArticleListView',
  components: {},
  props: [],
  data: () => {
    return {
      keys: [{
        'name': '文章标题',
        'field': 'title'
      }, {
        'name': '文章链接',
        'field': 'content_url'
      }, {
        'name': '文章作者',
        'field': 'author'
      }, {
        'name': '发布时间',
        'field': 'publish_time'
      }],
      keys_save: [{
        'name': '采集时间',
        'field': 'create_time'
      }]
    }
  },
  methods: {
    handleCloseA(event, name) {
      let current = this.keys.filter(item => item.name == name)
      this.keys = this.keys.filter(item => item.name != name)
      this.keys_save.push(current.pop())
    },
    handleCloseB(event, name) {
      let current = this.keys_save.filter(item => item.name == name)
      this.keys_save = this.keys_save.filter(item => item.name != name)
      this.keys.push(current.pop())
    },
    clickExport(type) {
      articleAction({
        'act': 'export',
        'type': type
      }, {
        fields: this.keys.map(a => a.field).join(',')
      })
    }
  },
  mounted() {},
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

.Page {
  perspective: 500px;
  padding: 10px 30px 50px 30px;
  background-color: #fff;
}

</style>
