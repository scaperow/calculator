<template>
  <v-toolbar flat color="transparent" class="d-flex justify-center" style="max-height:60px">
    <!-- {{selectionStyle}} -->
    <v-toolbar-items color="transparent">
      <v-tooltip bottom>
        <template v-slot:activator="{ on:tooltip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="font" v-show="hasStyle('font')" v-on="{...tooltip,...menu}">
                <v-icon>mdi-format-font</v-icon>
              </v-btn>
            </template>
            <v-card class="pa-4" width="300">
              <v-card-title>字体</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    @click="onSelectFont(font.name)"
                    v-for="(font,index) in fontList"
                    :command="font.name"
                    :key="index"
                    :style="{fontFamily:font.name}"
                  >{{font.label}}</v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <span>字体</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <color-picker
            :value="selectionStyle.fontColor"
            :show-swatches="true"
            @change="(color)=>setStyle('fontColor',color)"
            @reset="()=>resetStyle('fontColor')"
          >
            <template v-slot:activator="{on:color}">
              <v-btn
                key="fontColor"
                v-on="{...color,...tip}"
                v-show="hasStyle('fontColor')"
                :style="{borderColor:selectionStyle.fontColor}"
              >
                <v-icon :color="selectionStyle.fontColor">mdi-format-color-text</v-icon>
              </v-btn>
            </template>
          </color-picker>
        </template>
        <span>文字颜色</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{on:tip}">
          <v-menu :close-on-content-click="false" :nudge-width="200" offset-y>
            <template v-slot:activator="{on:menu}">
              <v-btn key="fontSize" v-on="{...tip,...menu}" v-show="hasStyle('fontSize')">
                <v-icon>mdi-format-size</v-icon>
              </v-btn>
            </template>
            <v-card width="320" class="pa-4">
              <v-card-title>
                <label>文字大小</label>
              </v-card-title>
              <v-card-text>
                <v-slider
                  :value="parseInt(selectionStyle.fontSize||14)"
                  @input="(value)=>setStyle('fontSize',value)"
                  :step="1"
                  :min="10"
                  :max="48"
                  thumb-size="48"
                  :thumb-label="true"
                >
                  <div slot="thumb-label">{{selectionStyle.fontSize||14}}px</div>
                </v-slider>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <label>文字大小</label>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            key="fontItalic"
            v-on="on"
            v-show="hasStyle('fontItalic')"
            :color="selectionStyle.fontItalic === true ? 'secondary':null"
            @click="setStyle('fontItalic',!selectionStyle.fontItalic)"
          >
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
        </template>
        <label>斜体</label>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            key="fontBold"
            v-on="on"
            :color="selectionStyle.fontBold === true ? 'secondary':null"
            v-show="hasStyle('fontBold')"
            @click="setStyle('fontBold',!selectionStyle.fontBold)"
          >
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
        </template>
        <span>粗体</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            key="isUnderline"
            :color="selectionStyle.isUnderline === true ? 'secondary':null"
            v-on="on"
            v-show="hasStyle('isUnderline')"
            @click="setStyle('isUnderline',!selectionStyle.isUnderline)"
          >
            <v-icon>mdi-format-underline</v-icon>
          </v-btn>
        </template>
        <span>下划线</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            key="isStrikethrough"
            :color="selectionStyle.isStrikethrough === true ? 'secondary':null"
            v-show="hasStyle('isStrikethrough')"
            @click="setStyle('isStrikethrough',!selectionStyle.isStrikethrough)"
            v-on="on"
          >
            <v-icon>mdi-format-strikethrough</v-icon>
          </v-btn>
        </template>
        <span>删除线</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <color-picker
            :show-swatches="true"
            :value="selectionStyle.fill"
            @change="(color)=>setStyle('fill',color)"
            @reset="()=>resetStyle('fill')"
          >
            <template v-slot:activator="{on:color}">
              <v-btn
                key="fill"
                v-on="{...color,...tip}"
                v-show="hasStyle('fill')"
                :style="{borderColor:selectionStyle.fill}"
              >
                <v-icon :color="selectionStyle.fill">mdi-format-color-fill</v-icon>
              </v-btn>
            </template>
          </color-picker>
        </template>
        <span>填充颜色</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <color-picker
            :show-swatches="true"
            :value="selectionStyle.stroke"
            @change="(color)=>setStyle('stroke',color)"
            @reset="()=>resetStyle('stroke')"
          >
            <template v-slot:activator="{on:color}">
              <v-btn
                key="stroke"
                v-on="{...color,...tip}"
                v-show="hasStyle('stroke')"
                :style="{borderColor:selectionStyle.stroke}"
              >
                <v-icon :color="selectionStyle.stroke">mdi-border-color</v-icon>
              </v-btn>
            </template>
          </color-picker>
        </template>
        <span>边框颜色</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="strokeWidth" v-show="hasStyle('strokeWidth')" v-on="{...menu,...tip}">
                <i slot="reference" class="iconfont icon-stroke"></i>

                <v-icon>mdi-border-all</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>边框粗细</label>
              </v-card-title>
              <v-card-text>
                <!-- <v-checkbox @change="(isCheck)=>setStyle('strokeWidth',isCheck?0:1)"
                            label="无边框"
                :checked="selectionStyle.strokeWidth != 0"></v-checkbox>-->
                <v-slider
                  :value="selectionStyle.strokeWidth"
                  @input="(value)=>setStyle('strokeWidth',value)"
                  :step="1"
                  :min="1"
                  :max="48"
                  :format-tooltip="(value)=>value + 'px'"
                  thumb-size="48"
                  :thumb-label="true"
                >
                  <div slot="thumb-label">{{selectionStyle.strokeWidth+'px'}}</div>
                </v-slider>
              </v-card-text>
              <v-card-actions class="d-flex flex-row-reverse">
                <v-btn text @click="resetStyle('strokeWidth')">重置</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <span>边框粗细</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn v-show="hasStyle('strokeDashArray')" v-on="{...menu,...tip}">
                <v-icon>mdi-border-style</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>边框样式</label>
              </v-card-title>

              <v-card-text>
                <div style="text-align:center">
                  <v-btn-toggle small v-model="strokeStyle" rounded color="secondary">
                    <v-btn small value="LIST">样式</v-btn>
                    <v-btn small value="CUSTOM">自定义</v-btn>
                  </v-btn-toggle>
                </div>

                <div v-show="strokeStyle === 'LIST'" style="text-align:center;width:100%">
                  <v-list>
                    <v-list-item-group @change="(value)=>setStyle('strokeDashArray', value)">
                      <v-list-item
                        v-for="(stroke,index) in strokeDashArrays"
                        :Key="index"
                        :value="stroke"
                      >
                        <svg width="100%" height="20" viewBox="0 0 200 20" stroke="#333">
                          <path v-bind="{'stroke-dasharray':stroke}" d="M0 10 L 200 10" />
                        </svg>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </div>
                <div v-show="strokeStyle === 'CUSTOM'">
                  虚线大小
                  <v-slider
                    :value="dashedSize"
                    width="100%"
                    max="20"
                    min="2"
                    :format-tooltip="(value)=>value + 'px'"
                    @change="(value)=>setStyle('strokeDashArray',[value, dashedSpacing])"
                    :thumb-label="true"
                  >
                    <div slot="thumb-label">{{dashedSize+'px'}}</div>
                  </v-slider>虚线间距
                  <v-slider
                    :value="dashedSpacing"
                    width="100%"
                    max="50"
                    min="2"
                    @change="(value)=>setStyle('strokeDashArray',[dashedSize, value])"
                    thumb-size="48"
                    :thumb-label="true"
                  >
                    <div slot="thumb-label">{{dashedSpacing+'px'}}</div>
                  </v-slider>
                </div>
              </v-card-text>
              <v-card-actions class="d-flex flex-row-reverse">
                <v-btn text @click="resetStyle('strokeDashArray')">重置</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <span>边框样式</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="radius" v-show="hasStyle('radius')" v-on="{...menu,...tip}">
                <v-icon>mdi-vector-radius</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>圆角</label>
              </v-card-title>
              <v-card-text>
                <v-slider
                  :value="selectionStyle.radius"
                  @input="(value)=>setStyle('radius',value)"
                  :step="1"
                  :min="0"
                  :max="40"
                  thumb-size="48"
                  :thumb-label="true"
                >
                  <div slot="thumb-label">{{selectionStyle.radius}}</div>
                </v-slider>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <span>圆角</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="opacity" v-show="hasStyle('opacity')" v-on="{...menu,...tip}">
                <v-icon>mdi-opacity</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>不透明度</label>
              </v-card-title>
              <v-card-text>
                <v-slider
                  :value="selectionStyle.opacity"
                  @input="(value)=>setStyle('opacity',value)"
                  :step="0.1"
                  :max="1"
                  thumb-size="48"
                  :thumb-label="true"
                >
                  <div slot="thumb-label">{{(selectionStyle.opacity * 100) + '%'}}</div>
                </v-slider>
              </v-card-text>
              <v-card-actions class="d-flex flex-row-reverse">
                <v-btn text @click="resetStyle('opacity')">重置</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <label>不透明度</label>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="opacity" v-show="hasStyle('line')" v-on="{...menu,...tip}">
                <v-icon v-if="selectionStyle.line === 'Bend'">mdi-vector-radius</v-icon>
                <v-icon v-else-if="selectionStyle.line === 'Straight'">mdi-vector-line</v-icon>
                <v-icon v-else>mdi-vector-rectangle</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>线条形状</label>
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item-group
                    :value="selectionStyle.line"
                    @change="(value)=>setStyle('line', value)"
                    color="primary"
                  >
                    <v-list-item value="Bend">
                      <v-list-item-avatar>
                        <v-icon>mdi-vector-radius</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>曲线</v-list-item-content>
                    </v-list-item>
                    <v-list-item value="Broken">
                      <v-list-item-avatar>
                        <v-icon>mdi-vector-rectangle</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content>折线</v-list-item-content>
                    </v-list-item>
                    <v-list-item value="Straight">
                      <v-list-item-avatar>
                        <v-icon>mdi-vector-line</v-icon>
                      </v-list-item-avatar>

                      <v-list-item-content>直线</v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <span>线条形状</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="fromArrow" v-show="hasStyle('fromArrow')" v-on="{...menu,...tip}">
                <v-icon>mdi-ray-start</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>起点形状</label>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    cols="2"
                    class="pa-2"
                    v-for="(arrowHead,index) in arrowHeads"
                    :key="index"
                    v-ripple
                    style="cursor:pointer"
                    @click="setStyle('fromArrow', arrowHead.key)"
                    :class="{'primary':arrowHead.key === selectionStyle.fromArrow}"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      width="20"
                      height="20"
                      :stroke="arrowHead.key === selectionStyle.fromArrow?'#fff':'#333'"
                      stroke-width="1"
                      style="display: block;margin: auto;"
                    >
                      <path
                        :d="arrowHead.value"
                        :fill="arrowHead.key === selectionStyle.fromArrow?'#fff':'#333'"
                      />
                    </svg>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn text @click="setStyle('fromArrow','')">清除形状</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <span>起点形状</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn key="fromArrow" v-show="hasStyle('toArrow')" v-on="{...menu,...tip}">
                <v-icon>mdi-ray-end</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>终点形状</label>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    cols="2"
                    class="pa-2"
                    v-for="(arrowHead,index) in arrowHeads"
                    :key="index"
                    v-ripple
                    style="cursor:pointer"
                    @click="setStyle('toArrow', arrowHead.key)"
                    :class="{'primary':arrowHead.key === selectionStyle.toArrow}"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      width="20"
                      height="20"
                      :stroke="arrowHead.key === selectionStyle.toArrow?'#fff':'#333'"
                      stroke-width="1"
                      style="display: block;margin: auto;"
                    >
                      <path
                        :d="arrowHead.value"
                        :fill="arrowHead.key === selectionStyle.toArrow?'#fff':'#333'"
                      />
                    </svg>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn text @click="setStyle('toArrow','')">清除形状</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <span>终点形状</span>
      </v-tooltip>

      <!-- <v-tooltip bottom>
        <template v-slot:activator="{ on:tip }">
          <v-menu offset-y
                  :close-on-content-click="false">
            <template v-slot:activator="{on:menu}">
              <v-btn v-show="hasStyle('strokeWidth')"
                     v-on="{...menu,...tip}">

                <v-icon>mdi-border-all</v-icon>
              </v-btn>
            </template>
            <v-card width="320">
              <v-card-title>
                <label>边框厚度</label>
              </v-card-title>
              <v-card-text>
                <v-slider :value="strokeWidth"
                          @input="(value)=>setStyle('strokeWidth',value)"
                          :step="1"
                          :min="0"
                          :max="24"
                          :format-tooltip="(value)=>value + 'px'"
                          thumb-size="48"
                          :thumb-label="true">
                  <div slot="thumb-label">
                    {{strokeWidth+'px'}}
                  </div>
                </v-slider>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
        <span>边框厚度</span>
      </v-tooltip>-->

      <!-- mdi-ray-start
      mdi-ray-end-->
      <!-- </transition-group> -->
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
import Parse from "parse";
import _ from "lodash";
import go from "gojs";
import { mapGetters, mapActions } from "vuex";
import { TemplateMaker } from "~/map";
import systemFonts from "~/store/predefine/fonts";
import systemColors from "~/store/predefine/colors";
import ColorPicker from "./ColorPicker";
const $ = go.GraphObject.make;

const arrowHeads = go.Shape.getArrowheadGeometries().toArray();

let toArrowMap = null;
let getLinkCategory = function(mapName) {
  switch (mapName) {
    case "MINDMAP":
      return "TreeLink";

    case "FLOWCHART":
      return "LineLink";
  }
};
let templateMaker = null;

export default {
  components: { ColorPicker },
  data() {
    return {
      strokeStyle: "LIST",
      strokeDashArrays: [[], [2, 2], [4, 2], [8, 4], [4, 8]],
      fontList: systemFonts,
      showPicker: false,
      selectionStyle: {},
      systemColors,
      selection: [],
      setting: {},
      rootStyle: {},
      meshStyle: {},
      ruleStyle: {},
      selectObjects: []
    };
  },
  computed: {
    ...mapGetters({
      map: "go/map",
      mapData: "go/mapData"
    }),
    dashedSize() {
      return (this.selectionStyle.strokeDashArray || [2, 5])[0];
    },

    dashedSpacing() {
      return (this.selectionStyle.strokeDashArray || [2, 5])[1];
    },
    fontSizeNumber: {
      set(value) {
        this.selectionStyle.fontSize = value + "px";
      },
      get() {
        return parseInt(this.selectionStyle.fontSize || 14);
      }
    },
    arrowHeads() {
      var path = null;
      var result = [];

      _.each(arrowHeads, (iterator, index) => {
        path = iterator.value.figures.first().toString();
        // exclude special Path contains 'B/b' that can't be explain for SVG
        // Char 'B/b' use for gojs SVG languages
        if (!/[Bb]+/g.test(path)) {
          result.push({
            key: iterator.key,
            value: path
          });
        }
      });

      return result;
    }
  },
  methods: {
    resetStyle(styleName) {
      this.map.templateMaker.resetStyle(
        this.map.canvas.selection.toArray(),
        styleName
      );
    },

    onSelectFont(commander) {
      this.selectionStyle.fontFamily = commander;
      this.map.templateMaker.changeStyle(
        "fontFamily",
        _.get(this.selectionStyle, styleName)
      );
    },

    changeListener(event) {
      var styles = null;
      var template = null;

      switch (event.name) {
        case "ChangedSelection":
          var selection = this.map.canvas.selection.toArray();
          var selectionStyle = {};
          if (selection.length > 0) {
            selectionStyle = _.chain(selection)
              //.map(item => item.category || ((item instanceof go.Link) ? getLinkCategory(this.map.name) : ''))
              .reduce((result, object, index) => {
                template = this.map.templateMaker.getTemplate(object);

                if (template) {
                  styles = _.keys(template.style);

                  if (index === 0) {
                    return styles;
                  } else {
                    return _.intersection(result, styles);
                  }
                }

                return result;
              }, [])
              .reduce((result, styleName, index) => {
                result[styleName] =
                  _.chain(selection)
                    .map(item => _.get(item.part.data, styleName))
                    .uniq()
                    .first()
                    .value() || null;

                return result;
              }, {})
              .value();
          }

          this.selectObjects = selection;
          this.selectionStyle = selectionStyle;

          break;
      }
    },
    hasStyle(...keys) {
      return _.filter(keys, key => _.has(this.selectionStyle, key)).length > 0;
    },
    getStyle(styleName, part) {
      switch (styleName) {
        case "fill":
          switch (part.category) {
            case "Shape":
              return part.data.fill;
              break;

            case "MonoCanvas":
              return part.data.itemArray[0].fill;
              break;

            default:
              return null;
          }
      }
    },
    setStyle(styleName, styleValue) {
      if (_.has(this.selectionStyle, styleName)) {
        _.set(this.selectionStyle, styleName, styleValue);
        this.map.templateMaker.changeStyle(styleName, styleValue);
      }
    }
  },
  watch: {
    map() {
      this.map.addMapListener("ChangedSelection", this.changeListener);
      this.setting = this.map.setting;
    }
  },
  mounted() {
    // toArrowMap = $(go.Palette, 'toArrowMap', {
    //   nodeTemplate: $(go.Node,
    //     $(go.Shape, {
    //       width: 40,
    //       height: 40,
    //     },
    //       new go.Binding('geometryString', 'geometryString'),
    //       new go.Binding('figure', 'figure')))
    // })
    // arrowHeads.forEach((arrowHead) => {
    //   toArrowMap.model.addNodeData({
    //     //figure: arrowHead.key,
    //     geometryString: arrowHead.value.toString()
    //   })
    // })
  }
};
</script>
<style lang="scss" scoped>
@import "~/assets/variables.scss";
section.menu-bar {
  margin: 6px 12px;
  background: transparent;

  ul.menu {
    background: transparent;
    width: 100%;
    height: 50px;
    -align: center;
    list-style-type: none;
    list-style: none;
    padding: 0;
    margin: 0;

    .v-divider--vertical {
      background: #ccc;
    }

    li {
      display: inline-block;
      border: solid 2px transparent;
      border-radius: 4px;

      i {
        font-size: 20px;
        -align: center;
        cursor: pointer;
        display: block;
        width: 36px;
        height: 36px;
        line-height: 36px;
        color: #666;
      }

      &:hover {
        background: #f0f0f0;
        i {
          color: #333;
        }
      }
    }
  }
}
</style>


