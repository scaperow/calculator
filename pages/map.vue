<template>
  <section class="d-flex flex-column flex-grow-1">
    <v-app-bar flat class="flex-grow-1 pa-2 grey lighten-5" style="max-height:80px;">
      <v-app-bar-nav-icon :nuxt="true" :to="{path:'/desktop',replace:true}">
        <h2 class="logo" style="display:inline-block"></h2>
      </v-app-bar-nav-icon>
      <v-hover v-slot:default="{ hover }">
        <div
          :style="{width:`${fileName.length * 20 + 24 }px`}"
          style="max-width:300px;min-width:80px"
        >
          <v-text-field
            :filled="hover"
            full-width
            hide-details
            type="text"
            class="file-name"
            @change="onNameChange"
            :value="fileName"
          ></v-text-field>
        </div>
      </v-hover>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            color="success"
            v-show="mapStatus === 'CHANGED' || mapStatus==='SAVING'"
          >mdi-spin mdi-loading</v-icon>
        </template>
        正在保存
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon color="grey" v-on="on" v-show="mapStatus === 'SUCCESS'">mdi-check-circle-outline</v-icon>
        </template>
        已保存
      </v-tooltip>

      <tool-bar v-show="!history"></tool-bar>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
        </template>
        <span>打印</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon @click="share" v-on="on">
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
        </template>
        <span>分享</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{on:tip}">
          <v-menu offset-y>
            <template v-slot:activator="{on:menu}">
              <v-btn icon v-on="{...tip,...menu}">
                <v-icon>mdi-cloud-download-outline</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <v-list>
                  <v-list-item @click="exportDocument('PDF')">PDF 文件(打印格式)</v-list-item>
                  <v-list-item @click="exportDocument('PNG')">PNG 文件(图片格式)</v-list-item>
                  <v-list-item @click="exportDocument('SVG')">SVG 文件(高清图片格式)</v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <span>导出</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu :close-on-content-click="false" :nudge-width="200" offset-x>
            <template v-slot:activator="{ on:menu }">
              <v-btn icon v-on="{...tip,...menu}">
                <v-icon>mdi-keyboard</v-icon>
              </v-btn>
            </template>
            <v-card class="pa-6" width="420" style="line-height:36px">
              <div>
                <v-chip label>Tab</v-chip>插入子主题
              </div>
              <div>
                <v-chip label>Enter</v-chip>插入同级别主题
              </div>
              <div>
                <v-chip label>Shift-Tab</v-chip>插入父级主题
              </div>
              <div>
                <v-chip label>Ctrl- ←</v-chip>折叠子主题
              </div>
              <div>
                <v-chip label>Ctrl- →</v-chip>展开子主题
              </div>
              <div>
                <v-chip label>Ctrl-Enter</v-chip>编辑主题文本
              </div>

              <div>
                <v-chip label>Ctrl-X & Shift-Del</v-chip>剪切选中
              </div>
              <div>
                <v-chip label>Ctrl-C & Ctrl-Insert</v-chip>复制
              </div>
              <div>
                <v-chip label>Ctrl-V & Shift-Insert</v-chip>粘贴
              </div>
              <div>
                <v-chip label>Del & Backspace</v-chip>删除选中
              </div>
              <div>
                <v-chip label>Ctrl-A</v-chip>选中所有
              </div>
              <div>
                <v-chip label>Ctrl-Z & Alt-Backspace</v-chip>撤销
              </div>
              <div>
                <v-chip label>Ctrl-Y & Alt-Shift-Backspace</v-chip>重做
              </div>
              <div>
                <v-chip label>↑ & ↓ & ← & →</v-chip>选中相邻方向的图形
              </div>
              <div>
                <v-chip label>PageUp & PageDown</v-chip>滚动视图
              </div>
              <div>
                <v-chip label>Home & End</v-chip>滚动视图
              </div>
              <div>
                <v-chip label>Space</v-chip>invokes scrollToPart
              </div>
              <div>
                <v-chip label>Ctrl-- & Keypad-- (minus)</v-chip>缩小视图
              </div>
              <div>
                <v-chip label>Ctrl-+ & Keypad-+ (plus)</v-chip>放大视图
              </div>
              <div>
                <v-chip label>Ctrl-0</v-chip>重置缩放
              </div>
              <div>
                <v-chip label>Shift-Z</v-chip>缩放到视图大小或恢复缩放
              </div>
              <div>
                <v-chip label>Ctrl-G</v-chip>合并所选内容
              </div>
              <div>
                <v-chip label>Ctrl-Shift-G</v-chip>取消合并所选内容
              </div>
              <div>
                <v-chip label>F2</v-chip>编辑文字
              </div>
              <div>
                <v-chip label>Menu Key</v-chip>显示右键菜单
              </div>
              <div>
                <v-chip label>Esc</v-chip>取消正在执行的命令
              </div>
            </v-card>
          </v-menu>
        </template>
        <span>快捷键</span>
      </v-tooltip>

      <user-avatar class="ml-4"></user-avatar>
    </v-app-bar>

    <div v-show="history" style="margin:12px 24px" class="tip" primary center>
      <h2>正在预览历史版本</h2>
      <div>
        <button text @click="applyHistory">还原到该版本</button>
        <button text @click="exitHistory">退出预览</button>
      </div>
    </div>
    <div class="grey lighten-2 d-flex flex-column flex-grow-1 pa-2">
      <div class="d-flex flex-row">
        <div
          class="d-flex flex-grow-1"
          :class="{'justify-center':shapeTab}"
          style="max-width:300px"
        >
          <v-btn-toggle class="ma-2" rounded color="black" v-model="shapeTab">
            <v-btn value="SHAPE">形状</v-btn>
            <v-btn value="ICON">图标</v-btn>
            <!-- <v-btn value="SEARCH">
              <v-icon>mdi-cloud-search</v-icon>
            </v-btn>-->
            <!-- <v-btn></v-btn> -->
          </v-btn-toggle>
        </div>
        <menu-bar></menu-bar>
        <div
          class="d-flex flex-grow-1"
          :class="settingTab?'justify-center':'justify-end'"
          style="max-width:300px"
        >
          <v-btn-toggle class="ma-2" rounded color="black" v-model="settingTab">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }" placement="left" content="页面设置">
                <v-btn value="SETTING" text icon v-on="on">
                  <v-icon>mdi-file-settings-variant</v-icon>
                </v-btn>
              </template>
              <span>页面设置</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn value="HISTORY" text icon v-on="on">
                  <v-icon>mdi-history</v-icon>
                </v-btn>
              </template>
              <span>历史记录</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn value="STYLE" text icon v-on="on">
                  <v-icon>mdi-palette</v-icon>
                </v-btn>
              </template>
              <span>主题</span>
            </v-tooltip>
            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn value="LAYER" text icon v-on="on">
                  <v-icon>mdi-layers</v-icon>
                </v-btn>
              </template>
              <span>图层</span>
            </v-tooltip>-->
          </v-btn-toggle>
        </div>
      </div>
      <div class="d-flex flex-row flex-grow-1" style="height:0;">
        <shape-bar
          :categories="shapeCategories"
          :category="shapeTab"
          style="width:300px;min-width:300px;max-width:300px"
          v-show="!history && shapeTab"
        ></shape-bar>
        <div style="position: absolute;right:12px;top:12px;z-index:9999999">
          <part-editor></part-editor>
        </div>
        <div
          style="padding:0 12px"
          class="d-flex flex-grow-1 flex-column align-center justify-center"
        >
          <div :id="drawerId" style="width:100%" class="flex-grow-1 elevation-6"></div>
        </div>
        <setting-bar
          :select-tab="settingTab"
          style="max-width:300px;min-width:300px"
          v-show="settingTab"
        ></setting-bar>
      </div>
    </div>
    <share-popover ref="sharePopover"></share-popover>
  </section>
</template>

<script>
import Go from "gojs";
import ShapeBar from "~/components/ShapeBar";
import SettingBar from "~/components/SettingBar";
import Vue from "vue";
import Parse from "parse";
import ToolBar from "~/components/ToolBar";
import { mapGetters } from "vuex";
import { Maps } from "~/map";
import MenuBar from "~/components/MenuBar";
import _ from "lodash";
import UserAvatar from "~/components/UserAvatar";
import SharePopover from "~/components/Share";
import FileSaver from "file-saver";
import PartEditor from "../components/PartEditor";

const WorksClass = Parse.Object.extend("works");

let exportPadding = 20;
let map = null;
let delaySave = null;
let currentModel = null;

export default {
  computed: {
    ...mapGetters({
      mapStatus: "go/status",
      history: "history/current",
      map: "go/map",
      style: "go/style",
      mapData: "go/mapData"
    }),
    fileName() {
      return (this.mapData && this.mapData.name) || "";
    }
  },
  data() {
    return {
      shapeCategories: [
        {
          label: "形状",
          value: "SHAPE"
        },
        {
          label: "图标",
          value: "ICON"
        }
      ],
      shapeTab: "SHAPE",
      settingTab: "SETTING",
      lastRaw: null,
      drawerId: "graphObject_" + new Date().getTime(),
      zoomScale: 100,
      statusMessage: ""
    };
  },
  components: {
    ShapeBar,
    SettingBar,
    ToolBar,
    MenuBar,
    UserAvatar,
    SharePopover,
    PartEditor
  },
  watch: {
    statusMessage(val) {
      if (!_.isEmpty(val)) {
        this.delayClearStaus();
      }
    },
    // setting: {
    //   handler({ root }) {
    //     grid.visible = root.showMesh;
    //     grid.elements.each(element => {
    //       element.stroke = root.meshColor;
    //     });

    //     gradScaleHoriz.elements.each(
    //       element => (element.stroke = root.ruleColor)
    //     );
    //     gradScaleVert.elements.each(
    //       element => (element.stroke = root.ruleColor)
    //     );

    //     if (root.showRule) {
    //       setupScalesAndIndicators();
    //     } else {
    //       unsetupScalesAndIndicators();
    //     }
    //   },
    //   deep: true
    // },
    history(value) {
      if (value) {
        if (!currentModel) {
          currentModel = this.map.getModel();
        }

        this.map.setModel(this.history.raw, false);
        this.map.setReadonly(false);
      }
    },
    settingTab() {
      this.map.canvas.requestUpdate();
    },
    shapeTab() {
      this.map.canvas.requestUpdate();
    }
  },
  methods: {
    applyHistory() {
      this.map.setReadonly(false);
      this.mapSource.set("raw", this.history.raw);
      this.$store.dispatch("history/setCurrent", null);
      this.save("model");
      this.$message.success("操作成功");

      currentModel = null;
    },
    exitHistory() {
      this.$store.dispatch("history/setCurrent", null);

      this.map.setModel(currentModel, false);
      this.map.setReadonly(false);

      currentModel = null;
    },
    share() {
      this.$refs.sharePopover.open(this.mapSource.id);
    },
    async exportDocument(arg) {
      var fileName = `${this.fileName}.${(arg || "").toUpperCase()}`;
      var exportData = null;

      switch (arg) {
        case "PNG":
          exportData = await this.map.capture(Maps.Captures.PNG);
          break;

        case "SVG":
          exportData = await this.map.capture(Maps.Captures.PNG);
          break;

        case "PDF":
          break;
      }

      if (exportData) {
        FileSaver.saveAs(exportData, fileName);
      } else {
        this.$message.error("导出失败, 请重新尝试");
      }
    },
    onNameChange(value) {
      if (_.isEmpty(this.fileName)) {
        this.fileName = "未命名文档";
      }

      if (this.fileName.length > 52) {
        this.fileName = this.fileName.substring(0, 52);
      }

      if (value !== this.fileName) {
        this.$store.dispatch("go/save", {
          name: value
        });
      }
    }
  },
  async mounted() {
    try {
      this.$store.dispatch("go/setMap", {
        mapId: this.$route.query.id,
        elementId: this.drawerId
      });
    } catch (error) {
      await this.$confirm(error.message);
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
