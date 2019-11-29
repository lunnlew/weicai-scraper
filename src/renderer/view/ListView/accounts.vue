<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft"></div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
        <div>
          <Input search enter-button placeholder="搜索公众号" @on-search="searchUniacc" @on-change="searchUniaccChange" />
        </div>
        <div class="ListContainer">
          <Table stripe :columns="columns" :data="list" @on-row-dblclick="rowDblclick">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="error" size="small" @click="remove(row, index)">删除</Button>
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
                      <ListItemMeta title="名称" :description="showExtraData.nickname" />
                    </ListItem>
                    <ListItem>
                      <ListItemMeta title="原始ID" :description="showExtraData.username" />
                    </ListItem>
                  </List>
                </TabPane>
                <TabPane label="数据">
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
import { fetchUniaccList, fetchUniaccDetail } from '@/api/source'
export default {
  name: 'ListView',
  components: {},
  props: [],
  data: () => {
    return {
      showExtraInfo: false,
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      total: 0,
      columns: [{
          title: '名称',
          key: 'nickname'
        }, {
          title: '原始ID',
          key: 'username'
        },
        {
          title: '操作',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ]
    }
  },
  methods: {
    remove(row, index) {
      this.$store.dispatch('deleteUniacc', {
        'row': row,
        'index': index
      })
    },
    searchUniaccChange(event) {
      console.log(event)
    },
    searchUniacc(val) {
      fetchUniaccList({
        act: 'list',
        keywords: val,
        page: this.currentPage,
        size: this.pageSize
      }).then(result => {
        this.total = result.data.total
        this.$store.dispatch('updateUniaccList', result.data.list)
      })
    },
    loadData() {
      fetchUniaccList({
        act: 'list',
        page: this.currentPage,
        size: this.pageSize
      }).then(result => {
        this.total = result.data.total
        this.$store.dispatch('updateUniaccList', result.data.list)
      })
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
      fetchUniaccDetail({
        act: 'detail',
        '_id': row._id
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
    list() {
      return this.$store.state.ListView.uniacclist
    }
  }
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
