<template>
  <div class="SidebarContainer">
    <button class="sidebar-menu-btn">
      <div>微采助手</div>
    </button>
    <div class="sidebar-scroller">
      <div class="sidebar-content">
        <div class="lib-navigation" role="navigation">
          <div class="sidebar-header-container">
            <div class="sidebar-header">
              <div class="SidebarLibrariesTitle">资料库</div>
              <div class="SidebarLibrariesActions">
                <button role="button" class="SidebarLibrariesActions-Btn" type="button">
                  <svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" stroke-miterlimit="1.414" stroke-linejoin="round" class="icon-svg icon-svg-btn">
                    <title>添加库</title>
                    <path d="m320 320l0 200-80 0 0-200-200 0 0-80 200 0 0-200 80 0 0 200 200 0 0 80-200 0"></path>
                  </svg>
                </button>
                <button role="button" class="SidebarLibrariesActions-Btn" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" class="icon-svg icon-svg-btn">
                    <title>更多操作 </title>
                    <path d="M350 280c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0-210c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0 420c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div role="navigation">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SidebarContainer',
  components: {},
  data: () => {
    return {}
  },
  methods: {
    changeMediaView(mediaLib) {
      let target = {
        view: mediaLib.pageView,
        data: {
          mediaLib: mediaLib
        }
      }
      this.$store.dispatch('changeMainView', target)
      this.$store.dispatch('setSelectedSideMediaLib', {
        mediaLib: mediaLib
      })
      // this.$store.dispatch('changeStyle', { 'style': 'background-default' })
    },
    showSideMenu(event, mediaLib) {}
  },
  watch: {},
  computed: {},
  created() {}
}

</script>
<style lang="less">
.SidebarContainer {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  width: 240px;
  height: 100%;
  background-color: rgba(0, 0, 0, .15);
  transform: translateZ(0);
}

.sidebar-menu-btn {
  margin: 0;
  outline: none;
  border: 0;
  border-radius: 0;
  background: none;
  text-align: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color .2s;
  user-select: none;
  touch-action: manipulation;
  color: #f9be03;
  display: block;
  flex-shrink: 0;
  padding: 0 25px;
  width: 100%;
  height: 60px;
  background-color: rgba(0, 0, 0, .3);
  font-size: 15px;
}

.sidebar-scroller {
  min-height: 50px;
  border: 3px solid transparent;
  border-radius: 8px;
  background-clip: padding-box;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
  padding-right: 5px;
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

.sidebar-content {
  padding-top: 10px;
  padding-bottom: 60px;
  padding-right: 5px;
}

.sidebar-header {
  overflow: hidden !important;
  min-width: 0;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap !important;
  align-content: center;
  padding-left: 25px;
  height: 45px;
  color: hsla(0, 0%, 100%, .3);
  text-transform: uppercase;
  font-size: 12px;
  line-height: 45px;
  display: flex;
  align-items: center;
}

.sidebar-item {
  position: relative;
  display: flex;
  min-height: 30px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;

  &:hover {
    background-color: hsla(0, 0%, 100%, .08);

    .sidebar-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.link-color-default {
  color: hsla(0, 0%, 100%, .7);
}

.sidebar-link {
  cursor: pointer;
  display: block;
  flex-grow: 1;
  overflow: hidden;
  padding: 4px 0 2px 25px;

  &:hover {
    color: #fff;
  }
}

.sidebar-link-container {
  display: flex;
}

.sidebar-link-icon {
  flex-shrink: 0;
  width: 25px;
  height: 14px;
  font-size: 14px;

  .icon-svg {
    top: -1px;
  }
}

.icon-svg {
  position: relative;
  top: 2px;
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  line-height: 1;
  fill: currentColor;
}

.icon-svg-btn {
  top: -1px;
}

.sidebar-link-title {
  font-size: 14px;
  line-height: 1.71428571;
  flex-grow: 1;
  word-break: break-word;
}

.sidebar-btn {
  margin: 0;
  padding: 0;
  outline: none;
  border: 0;
  border-radius: 0;
  background: none;
  text-align: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color .2s;
  user-select: none;
  touch-action: manipulation;
  color: hsla(0, 0%, 100%, .7);
  width: 26px;
  height: 30px;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .2s, transform .1s;
  transform: translateX(-5px);

  &:hover {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-btn-icon {
  flex-shrink: 0;
  width: 25px;
  height: 14px;
  font-size: 14px;
}

.SidebarLibrariesTitle {
  overflow: hidden !important;
  min-width: 0;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap !important;
  flex-grow: 1;
}

.SidebarLibrariesActions {
  flex-shrink: 0;
  margin: 0 10px;
}

.SidebarLibrariesActions-Btn {
  margin: 0;
  padding: 0;
  outline: none;
  border: 0;
  border-radius: 0;
  background: none;
  text-align: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color .2s;
  user-select: none;
  touch-action: manipulation;
  color: hsla(0, 0%, 100%, .7);
  width: 26px;
  height: 30px;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  transition: opacity .2s;
  opacity: 0;
}

.lib-navigation {
  &:hover {
    .SidebarLibrariesActions {
      .SidebarLibrariesActions-Btn {
        opacity: 1;
      }
    }
  }
}

</style>
