<template>
  <section class="setting-bar" style="overflow-y:auto">
    <!-- <div style="max-width:80px" class="d-flex flex-column pt-4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }" placement="left" content="页面设置">
            <v-btn
              class="tab"
              text
              icon
              v-on="on"
              :color="selectTab==='SETTING'?'primary':'info'"
              @click="selectTab ='SETTING'"
            >
              <v-icon>mdi-file-settings-variant</v-icon>
            </v-btn>
          </template>
          <span>页面设置</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="tab"
              @click="selectTab ='HISTORY'"
              :color="selectTab==='HISTORY'?'primary':'info'"
              text
              icon
              v-on="on"
            >
              <v-icon>mdi-history</v-icon>
            </v-btn>
          </template>
          <span>历史记录</span>
        </v-tooltip>

        <v-tooltip bottom v-if="map.name !== 'MINDMAP'">
          <template v-slot:activator="{ on }">
            <v-btn
              class="tab"
              text
              icon
              @click="selectTab ='STYLE'"
              :color="selectTab==='STYLE'?'primary':'info'"
              v-on="on"
            >
              <v-icon>mdi-palette</v-icon>
            </v-btn>
          </template>
          <span>主题</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="tab"
              text
              icon
              @click="selectTab ='LAYER'"
              :color="selectTab==='LAYER'?'primary':'info'"
              v-on="on"
            >
              <v-icon>mdi-layers</v-icon>
            </v-btn>
          </template>
          <span>图层</span>
        </v-tooltip>
    </div>-->

    <div class="content" v-if="setting && map">
      <div class="tab" v-show="selectTab==='SETTING'">
        <v-subheader>页面设置</v-subheader>
        <v-card flat>
          <v-card-title>规格设置</v-card-title>
          <v-card-text>
            <v-select
              @change="(value)=>onChangeSize(value)"
              :items="pageSizes"
              label="页面尺寸"
              filled
              item-value="key"
              :item-text="(size)=>`${size.label} ${(size.width && size.height)? (size.width +'px' +' x ' +size.height + 'px'):''}`"
              :value="setting.size"
            ></v-select>
            <div v-show="setting.size === 'CUSTOM'">
              <v-text-field label="高度" filled type="number" v-model="height">
                <template slot="append">px</template>
              </v-text-field>
            </div>

            <div v-show="setting.size === 'CUSTOM'">
              <v-text-field label="宽度" filled type="number" v-model="width">
                <template slot="append">px</template>
              </v-text-field>
            </div>

            <div>
              <label>方向</label>
              <v-radio-group
                :value="direction"
                @change="(setting)=>changeSetting('direction',setting)"
              >
                <v-radio label="水平" value="H">H</v-radio>
                <v-radio label="垂直" value="V">V</v-radio>
              </v-radio-group>
            </div>

            <div>
              <color-picker
                :show-swatches="true"
                :value="setting.background"
                @change="(color)=>changeSetting('background', color)"
              >
                <template v-slot:activator="{on}">
                  <v-btn small icon text outlined v-on="on">
                    <v-icon :color="setting.background">mdi-invert-colors mdi-18px</v-icon>
                  </v-btn>
                </template>
              </color-picker>

              <label>背景颜色</label>
            </div>
          </v-card-text>
        </v-card>

        <v-card flat color="grey-light-2">
          <v-card-title>网格</v-card-title>
          <v-card-text>
            <div>
              <v-switch
                :value="setting.showMesh"
                @change="changeSetting('showMesh', !setting.showMesh)"
                label="显示网格"
              ></v-switch>
            </div>

            <div v-show="setting.showMesh">
              <color-picker
                :show-swatches="true"
                :value="meshColor"
                @change="(color)=>changeSetting('meshColor', color)"
              >
                <template v-slot:activator="{on}">
                  <v-btn small v-on="on" text icon outlined>
                    <v-icon :color="meshColor">mdi-invert-colors mdi-18px</v-icon>
                  </v-btn>
                </template>
              </color-picker>

              <label>网格颜色</label>
            </div>
          </v-card-text>
        </v-card>

        <v-card flat>
          <v-card-title>参考线</v-card-title>
          <v-card-text>
            <div>
              <v-switch
                :value="setting.showRule"
                @change="changeSetting('showRule', !setting.showRule)"
                label="显示参考线"
              ></v-switch>
            </div>

            <div>
              <color-picker
                color="black"
                :value="ruleColor"
                :show-swatches="true"
                @change="(color)=>changeSetting('ruleColor', color)"
                v-model="ruleColor"
              >
                <template v-slot:activator="{on}">
                  <v-btn small text icon outlined color="black" v-on="on">
                    <v-icon :color="ruleColor">mdi-invert-colors mdi-18px</v-icon>
                  </v-btn>
                </template>
              </color-picker>
              <label>参考线颜色</label>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="tab" v-show="selectTab==='HISTORY'">
        <v-subheader>历史记录</v-subheader>
        <v-alert center v-if="historyList.length ===0">暂无记录</v-alert>
        <div v-else>
          <v-card
            class="history mb-2 grey"
            :class="currentHistory === history?'lighten-2':'lighten-4'"
            v-for="(history,index) in historyList "
            :key="index"
            flat
            @click="previewHistory(history)"
          >
            <v-card-text>
              <strong>{{new Date(history.updatedAt).getTime() | date('%Y-%m-%d %T')}}</strong>
              <p class="mt-2">
                <i>{{history.note || '自动保存'}}</i>
              </p>

              <div class="d-flex flex-row-reverse">
                <v-menu offset-y>
                  <template v-slot:activator="{on}">
                    <v-btn v-show="currentHistory === history" text color="primary" v-on="on">删除</v-btn>
                  </template>
                  <v-card>
                    <v-card-text>删除后无法恢复, 是否继续?</v-card-text>
                    <v-card-actions class="d-flex flex-row-reverse">
                      <v-btn text primary @click="removeHistory(history,index)">是</v-btn>
                      <v-btn text>否</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-alert v-show="historyList.length  >= 20">最多可显示 20 条历史记录</v-alert>
      </div>
      <div class="tab" v-show="selectTab==='THEME'">
        <v-subheader>主题</v-subheader>
        <v-card flat class="mb-2">
          <v-card-text class="d-flex justify-center align-content-center">
            <style-palatte :styleObject="selectStyle"></style-palatte>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-icon color="success">mdi-check</v-icon>
            {{selectStyle.name}}
          </v-card-actions>
        </v-card>

        <v-card
          v-for="(style,index) in styleList"
          flat
          class="mb-2"
          :key="index"
          v-show="style.objectId !== selectStyle.objectId"
          @click="setStyle(style)"
        >
          <v-card-text class="d-flex justify-center align-content-center">
            <style-palatte :styleObject="style"></style-palatte>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-icon color="success" v-if="selectStyle.objectId === style.objectId">mdi-check</v-icon>
            {{style.name}}
          </v-card-actions>
        </v-card>
      </div>
      <div class="tab" v-show="selectTab === 'LAYER'"></div>
    </div>
  </section>
</template>
<script>
/**
 * 1. User setting
 * 2. Template setting
 * 3. Default setting
 */
import Parse from "parse";
import _ from "lodash";
import Go from "gojs";
import { mapGetters, mapActions, mapState } from "vuex";
import { TemplateMaker } from "~/map";
import Pixel from "unit-to-px";
import ColorPicker from "../components/ColorPicker";
import StylePalatte from "../components/StylePalatte";

const StyleClass = Parse.Object.extend("style");
const HistoryClass = Parse.Object.extend("history");
const StyleCanvasModel = JSON.stringify({
  class: "GraphLinksModel",
  nodeDataArray: [
    {
      figure: "Circle",
      zOrder: 0,
      name: "开始",
      category: "Shape",
      key: -1,
      location: "-100 -100",
      size: "50 50"
    },
    {
      figure: "Diamond",
      zOrder: 0,
      name: "判定",
      category: "Shape",
      key: -2,
      location: "-100 0",
      size: "50 50"
    },
    {
      figure: "RoundedRectangle",
      zOrder: 0,
      name: "流程",
      category: "Shape",
      key: -4,
      location: "0 -100",
      size: "40 40"
    }
  ],
  linkDataArray: [
    { from: -1, to: -2, points: [-85, -85, 0, -50] },
    { from: -2, to: -3, points: [-100, 0, 0, -100] }
  ]
});

const $ = Go.GraphObject.make;

let palettes = {};
let pageSizes = [
  {
    key: "AUTO",
    label: "自适应"
  },
  {
    key: "A3",
    label: "A3",
    width: parseInt(Pixel("297mm")),
    height: parseInt(Pixel("420mm"))
  },
  {
    key: "A4",
    label: "A4",
    width: parseInt(Pixel("210mm")),
    height: parseInt(Pixel("297mm"))
  },
  {
    key: "A5",
    label: "A5",
    width: parseInt(Pixel("148mm")),
    height: parseInt(Pixel("210mm"))
  },
  {
    key: "CUSTOM",
    label: "自定义"
  }
];

// Every nodeData which category name will be as 'Key'

export default {
  props: {
    selectTab: {
      default: "SETTING"
    }
  },
  data() {
    return {
      pageSizes,
      isLoadingHistory: false
    };
  },
  components: {
    ColorPicker,
    StylePalatte
  },
  watch: {
    selectTab() {
      switch (this.selectTab) {
        case "STYLE":
          this.getStyles();

          break;

        case "HISTORY":
          this.getHistories();
      }
    }
  },
  methods: {
    async previewHistory(history) {
      this.$store.dispatch("history/setCurrent", history.objectId);
    },
    async removeHistory(history, index) {
      try {
        await this.$store.dispatch("history/remove", history.objectId);
      } catch (error) {
        this.$catch(error);
      }
    },
    changeStyle(style) {
      // this.$store.dispatch("go/setStyle", style);
    },
    onChangeSize(size) {
      var { width, height } = _.find(this.pageSizes, { key: size });
      var changes = {
        size: size
      };

      switch (size) {
        case "AUTO":
          changes.width = "100%";
          changes.height = "100%";
          break;

        case "CUSTOM":
          changes.width = this.map.canvas.div.offsetWidth + "px";
          changes.height = this.map.canvas.div.offsetHeight + "px";
          break;

        default:
          changes.width = parseInt(width) + "px";
          changes.height = parseInt(height) + "px";

          break;
      }

      this.map.changeSetting(changes);
    },
    changeSetting(key, value) {
      this.map.changeSetting({
        [key]: value
      });
    },
    async getStyles() {
      try {
        await this.$store.dispatch("style/getList");
      } catch (error) {
        this.$catch(error);
      }
    },
    async getHistories() {
      this.isLoadingHistory = true;

      try {
        await this.$store.dispatch("history/getList", {
          works: this.mapSource.id
        });
      } catch (error) {
        this.$catch(error);
      } finally {
        this.isLoadingHistory = false;
      }
    }
  },
  computed: {
    selectStyle() {
      return _.get(this.map, "style");
    },
    historyList() {
      return _.chain(this.$store.state.history.list)
        .sortBy("createdAt")
        .reverse()
        .take(20)
        .value();
    },
    ...mapGetters({
      map: "go/map",
      styleList: "style/list",
      mapSource: "go/mapObject",
      currentHistory: "history/current"
    }),
    setting() {
      if (this.map) {
        return this.map.setting;
      }

      return null;
    },
    meshColor() {
      return (
        _.get(this.map, "setting.meshColor") ||
        _.get(this.map, "style.root.MeshColor")
      );
    },
    ruleColor() {
      return (
        _.get(this.map, "setting.ruleColor") ||
        _.get(this.map, "style.root.RuleColor")
      );
    },
    width: {
      set(value) {
        this.changeSetting("width", parseInt(value) + "px");
      },
      get() {
        return parseInt(this.setting.width);
      }
    },
    height: {
      set(value) {
        this.changeSetting("height", parseInt(value) + "px");
      },
      get() {
        return parseInt(this.setting.height);
      }
    },
    direction: {
      set(value) {
        this.changeSetting("direction", value);
      },
      get() {
        return this.setting.direction;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
section.setting-bar {
  .content {
    background: #fff;
    border-radius: 6px;
    padding-bottom: 6px;
  }
  // .tab {
  //   padding: 16px 0;
  //   border-radius: 16px;
  //   background: #fff;
  // }
}
</style>


