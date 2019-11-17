<template>
  <div class="ListView">
    <div class="pageHeader">
      <div class="pageHeaderLeft">
        <div class="tags">
          <span class="label">采集代理</span>
          <i-switch size="large" v-model="switchProxy" @on-change="switchProxyChange">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
          <span class="label">后台文章图片生成任务</span>
          <i-switch size="large" v-model="switchJob" @on-change="switchJobChange">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </div>
      </div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="ListPageContent">
      <div class="ListScroller">
        <div class="ListContainer">
          <Table stripe :columns="columns" :data="list" @on-row-dblclick="rowDblclick">
            <template slot-scope="{ row, index }" slot="readNum">
              {{ row.readNum | fmtNum }}
            </template>
            <template slot-scope="{ row, index }" slot="likeNum">
              {{ row.likeNum | fmtNum }}
            </template>
            <template slot-scope="{ row, index }" slot="rewardTotalCount">
              {{ row.rewardTotalCount | fmtNum }}
            </template>
            <template slot-scope="{ row, index }" slot="html_jpg">
              <div v-if="row.html_jpg" style="color: green">
                已生成
              </div>
              <div v-else>
                未生成
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="publish_time">
              {{ row.publish_time | fmtDate('yyyy-MM-dd hh:mm') }}
            </template>
          </Table>
          <div style="text-align: left;margin-top: 30px;">
            <Page :total="total" show-total show-sizer show-elevator :page-size="pageSize" :current="currentPage" @on-change="changePage" @on-page-size-change="changeSizePage"></Page>
          </div>
        </div>
      </div>
      <div class="infoWrapper" v-if="showExtraInfo">
        <div class="relativeWrapper">
          <div class="contentWrapper">
            <div class="content">
              <div class="btns">
                <Tooltip placement="top-end">
                  <Icon type="md-close" size="20" @click="showExtraInfo=false" />
                </Tooltip>
              </div>
              <Tabs size="small">
                <TabPane label="信息">
                  <List>
                    <ListItem>
                      <ListItemMeta title="标题" :description="showExtraData.title" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="作者" :description="showExtraData.author" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="摘要" :description="showExtraData.desc" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="链接" :description="showExtraData.content_url" />
                    </ListItem>
                  </List>
                </TabPane>
                <TabPane label="数据">
                  <List>
                    <ListItem>
                      <ListItemMeta title="阅读量" :description="showExtraData.readNum" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="点赞量" :description="showExtraData.likeNum" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="打赏量" :description="showExtraData.rewardTotalCount" />
                    </ListItem>
                  </List>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { fetchList, fetchDetail, proxyAct, jobAct } from '@/api/source'
export default {
  name: 'ListView',
  components: {},
  props: [],
  data: () => {
    return {
      showExtraInfo: false,
      showExtraData: {},
      switchProxy: false,
      switchJob: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      columns: [{
        title: '标题',
        key: 'title'
      }, {
        title: '作者',
        key: 'author'
      }, {
        title: '阅读量',
        key: 'readNum',
        slot: 'readNum'
      }, {
        title: '点赞量',
        key: 'likeNum',
        slot: 'likeNum'
      }, {
        title: '打赏量',
        key: 'rewardTotalCount',
        slot: 'rewardTotalCount'
      }, {
        title: '图片',
        key: 'html_jpg',
        slot: 'html_jpg'
      }, {
        title: '发布时间',
        key: 'publish_time',
        slot: 'publish_time'
      }]
    }
  },
  methods: {
    loadData() {
      fetchList({
        act: 'list',
        page: this.currentPage,
        size: this.pageSize
      }).then(result => {
        this.total = result.data.total
        this.$store.dispatch('updateList', result.data.list)
      })
    },
    switchProxyChange(status) {
      this.switchProxy = status
    },
    switchJobChange(status) {
      this.switchJob = status
    },
    changePage(page) {
      this.currentPage = page
    },
    changeSizePage(size) {
      this.pageSize = size
    },
    rowDblclick(row, index) {
      this.showExtraInfo = true
      this.showExtraData = row
      fetchDetail({
        act: 'detail',
        'msg_sn': row.msg_sn
      }).then(result => {
        this.showExtraData = result.data
      })
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    // 由于Job任务会访问网络,所以proxy与job只能同时启动其中一个
    switchProxy() {
      if (this.switchProxy) {
        this.switchJob = false
      }
      proxyAct({
        'act': this.switchProxy ? 'start' : 'close'
      }).then(result => {})
    },
    switchJob() {
      if (this.switchJob) {
        this.switchProxy = false
      }
      jobAct({
        'act': this.switchJob ? 'start' : 'close'
      }).then(result => {})
    },
    pageSize() {
      this.loadData()
    },
    currentPage() {
      this.loadData()
    }
  },
  computed: {
    list() {
      return this.$store.state.ListView.list
    }
  }
}

</script>
<style lang="less" scoped>
.ListView {
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

.ListPageContent {
  position: relative;
  flex-grow: 1;
}

.infoWrapper {
  display: block;
  position: absolute;
  z-index: 1000;
  top: 0;
  bottom: 0;
  left: 60%;
  right: 0;
  background-color: rgba(102, 102, 102, 0.37);
  overflow: hidden;
  -webkit-box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  -moz-box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  will-change: left;
}

.relativeWrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.contentWrapper {
  color: #1a1a1a;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.content {
  background: #fff;
  overflow: auto;
  width: 100%;
  height: 100%;
  position: relative;

  padding: 5px 15px;
  height: 100%;
  word-wrap: break-word;

  .btns {
    border-radius: 0 0 3px 3px;
    padding: 2px 5px;
    position: absolute;
    top: 5px;
    right: 0;
    color: #b2b2b2;
    cursor: pointer;
  }
}

.ListScroller {
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

.ListContainer {
  perspective: 500px;
  padding: 0px 30px 50px 30px;
  background-color: #fff;
}

.ListItem {}

.ivu-tabs {
  word-break: break-word;
}

</style>
