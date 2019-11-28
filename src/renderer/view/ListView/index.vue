<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft">
        <div class="tags">
          <span class="label">采集代理</span>
          <i-switch size="large" v-model="boolSwitchProxy" @on-change="switchProxyChange">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
          <span class="label">后台文章图片生成任务</span>
          <i-switch size="large" v-model="boolSwitchJob" @on-change="switchJobChange">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </i-switch>
        </div>
      </div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
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
            <template slot-scope="{ row, index }" slot="action">
              <ButtonGroup size="small">
                <Button type="primary" size="small" @click="show(row, index)">查看</Button>
                <Button type="info" size="small" :loading="loadingMakeimgs[index]" @click="makeimg(row, index)">生成</Button>
                <Button type="error" size="small" @click="remove(row, index)">删除</Button>
              </ButtonGroup>
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
                      <ListItemMeta title="摘要" :description="showExtraData.msg_desc" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="链接" :description="showExtraData.content_url" />
                    </ListItem>
                  </List>
                </TabPane>
                <TabPane label="评论">
                  <List>
                    <ListItem v-for="(item,i) in showExtraData.elected_comment">
                      <ListItemMeta :avatar="item.logo_url" :title="item.nick_name" :description="item.content" />
                      <div class="list-c" v-if='item.reply.reply_list.length'>
                        <List>
                          <ListItem v-for="(rp,j) in item.reply.reply_list">
                            <ListItemMeta title="作者" :description="rp.content" />
                          </ListItem>
                        </List>
                      </div>
                    </ListItem>
                  </List>
                </TabPane>
                <TabPane label="数据">
                  <List>
                    <ListItem>
                      <ListItemMeta title="阅读数" :description="showExtraData.readNum+''" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="点赞数" :description="showExtraData.likeNum+''" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="打赏量" :description="showExtraData.rewardTotalCount+''" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="评论数" :description="showExtraData.elected_comment_total_cnt+''" />
                    </ListItem>
                  </List>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal fullscreen v-model="previewModel">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>文章查看(图片)</span>
      </p>
      <div style="text-align:center">
        <img style="max-width: 100%" v-if="preview.html_jpg" :src="'http://localhost:6877/article?act=preview&_id='+preview._id" />
        <p v-else>还未生成文章图片</p>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long @click="previewModel=false">关闭</Button>
      </div>
    </Modal>
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
      loadingMakeimgs: [],
      previewModel: false,
      preview: {},
      showExtraInfo: false,
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      total: 0,
      columns: [{
          title: '标题',
          key: 'title'
        }, {
          title: '作者',
          key: 'author',
          width: 160
        }, {
          title: '阅读量',
          key: 'readNum',
          slot: 'readNum',
          width: 100
        }, {
          title: '点赞量',
          key: 'likeNum',
          slot: 'likeNum',
          width: 80
        }, {
          title: '打赏量',
          key: 'rewardTotalCount',
          slot: 'rewardTotalCount',
          width: 80
        }, {
          title: '图片',
          key: 'html_jpg',
          slot: 'html_jpg',
          width: 80
        }, {
          title: '发布时间',
          key: 'publish_time',
          slot: 'publish_time',
          width: 160
        },
        {
          title: '操作',
          slot: 'action',
          width: 250,
          align: 'center'
        }
      ]
    }
  },
  methods: {
    show(row, index) {
      this.previewModel = true
      this.preview = row
    },
    makeimg(row, index) {
      if (this.loadingMakeimgs[index]) {
        return
      }
      this.$set(this.loadingMakeimgs, index, true)
      fetchDetail({
        act: 'makeimg',
        '_id': row._id
      }).then(result => {
        this.$set(this.loadingMakeimgs, index, false)
      })
    },
    remove(row, index) {
      this.$store.dispatch('deleteArticle', {
        'row': row,
        'index': index
      })
    },
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
      this.$store.dispatch('switchProxy', status)
    },
    switchJobChange(status) {
      this.$store.dispatch('switchJob', status)
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
    pageSize() {
      this.loadData()
    },
    currentPage() {
      this.loadData()
    }
  },
  computed: {
    boolSwitchProxy: {
      get: function() {
        return this.$store.state.ListView.boolSwitchProxy
      },
      set: function(v) {}
    },
    boolSwitchJob: {
      get: function() {
        return this.$store.state.ListView.boolSwitchJob
      },
      set: function(v) {}
    },
    list() {
      return this.$store.state.ListView.list
    }
  }
}

</script>
<style lang="less">
.ivu-modal-body {
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-color: hsla(0, 0%, 100%, .2) transparent;
}

.ivu-modal-body::-webkit-scrollbar {
  width: 14px;
}

.ivu-modal-body::-webkit-scrollbar-track {
  background-color: #17233d;
}

.ivu-modal-body::-webkit-scrollbar-thumb {
  min-height: 50px;
  border: 3px solid transparent;
  border-radius: 8px;
  background-color: hsla(0, 0%, 100%, .2);
  background-clip: padding-box;
}

.ivu-modal-body::-webkit-scrollbar-thumb:hover {
  background-color: hsla(0, 0%, 100%, .3);
}

.ivu-modal-body::-webkit-scrollbar-thumb:window-inactive {
  background-color: hsla(0, 0%, 100%, .05);
}

.ivu-modal-footer {
  padding: 9px 18px 12px 18px;
}


.ivu-list-split .ivu-list-items .ivu-list-item {
  flex-direction: column;
  align-items: flex-start;
}

.ivu-list-split .ivu-list-items .list-c {
  padding-left: 20px;
}

</style>
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
