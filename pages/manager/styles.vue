<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <h4>
          所有主题 [{{list.length}}]
          <v-btn text color="primary" @click="create">创建</v-btn>
        </h4>
        <v-divider></v-divider>

        <v-list dense>
          <v-list-item v-for="(style,index) in list" :key="index" @click="selectStyle= style">
            <v-list-item-content>{{style.name}}</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="10" v-if="selectStyle">
        <v-row>
          <v-col>
            <v-btn-toggle v-model="viewMode">
              <v-btn value="card">CARD</v-btn>
              <v-btn value="editor">EDITOR</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="6" class="text-right">
            <v-btn color="primary" @click="save">保存</v-btn>
            <v-btn color="error" v-if="!isDefault" @click="remove(style)">删除</v-btn>
          </v-col>
        </v-row>

        <div style="max-width:880px">
          <v-row>
            <v-col cols="2">
              <v-text-field label="主题名称" v-model="name" hide-details>名称</v-text-field>
            </v-col>
            <v-col cols="2">
              <v-checkbox v-model="isDefault" label="是否默认" :disabled="false"></v-checkbox>
            </v-col>

            <v-col cols="2">
              <label>背景颜色</label>
              <color-picker v-model="rootStyle.background" show-swatches>
                <template v-slot:activator="{on}">
                  <v-btn small icon text outlined v-on="on">
                    <v-icon :color="rootStyle.background">mdi-invert-colors</v-icon>
                  </v-btn>
                </template>
              </color-picker>
            </v-col>
            <v-col cols="2">
              <label>参考线颜色</label>
              <color-picker v-model="rootStyle.ruleColor" show-swatches>
                <template v-slot:activator="{on}">
                  <v-btn small icon text outlined v-on="on">
                    <v-icon :color="rootStyle.ruleColor">mdi-invert-colors</v-icon>
                  </v-btn>
                </template>
              </color-picker>
            </v-col>
            <v-col cols="2">
              <label>网格颜色</label>
              <color-picker v-model="rootStyle.meshColor" show-swatches>
                <template v-slot:activator="{on}">
                  <v-btn small icon text outlined v-on="on">
                    <v-icon :color="rootStyle.meshColor">mdi-invert-colors</v-icon>
                  </v-btn>
                </template>
              </color-picker>
            </v-col>
          </v-row>
        </div>
        <div v-show="viewMode === 'editor'">
          <v-btn-toggle v-model="editorMode">
            <v-btn value="tree">TREE</v-btn>
            <v-btn value="view">VIEW</v-btn>
            <v-btn value="form">FORM</v-btn>
            <v-btn value="code">CODE</v-btn>
            <v-btn value="text">TEXT</v-btn>
          </v-btn-toggle>
          <div ref="jsonEditor" style="width:100%;height:800px"></div>
        </div>
        <div v-show="viewMode === 'card'" style="white-space:nowrap;overflow-x:auto">
          <v-card
            v-for="(category,key) in categoryStyles"
            :key="key"
            dark
            class="ma-2 grey"
            style="display:inline-block;padding:12px;border-radius:12px;"
          >
            <v-card-title>{{key | uppercase}}</v-card-title>
            <v-card-text v-if="category" style="overflow-y: auto;">
              <v-form>
                <div v-show="category.fill !== undefined">
                  <label>背景颜色</label>
                  <color-picker v-model="category.fill" show-swatches>
                    <template v-slot:activator="{on}">
                      <v-btn small icon text outlined v-on="on">
                        <v-icon :color="category.fill">mdi-invert-colors</v-icon>
                      </v-btn>
                    </template>
                  </color-picker>
                </div>

                <v-text-field
                  label="边框大小"
                  type="number"
                  v-model="category.strokeWidth"
                  v-show="category.strokeWidth!== undefined"
                ></v-text-field>

                <div v-show="category.stroke !== undefined">
                  <label>边框颜色</label>
                  <color-picker v-model="category.stroke" show-swatches>
                    <template v-slot:activator="{on}">
                      <v-btn small icon text outlined v-on="on">
                        <v-icon :color="category.stroke">mdi-invert-colors</v-icon>
                      </v-btn>
                    </template>
                  </color-picker>
                </div>

                <v-select
                  label="字体"
                  v-model="category.fontFamily"
                  :items="systemFonts"
                  item-value="name"
                  item-text="name"
                  v-show="category.fontFamily!== undefined"
                >
                  <label></label>
                </v-select>

                <v-text-field
                  label="字体大小"
                  v-show="category.fontSize!== undefined"
                  type="number"
                  v-model="category.fontSize"
                ></v-text-field>

                <div v-show="category.fontColor">
                  <label>字体颜色</label>
                  <color-picker v-model="category.fontColor" show-swatches>
                    <template v-slot:activator="{on}">
                      <v-btn small icon text outlined v-on="on">
                        <v-icon :color="category.fontColor">mdi-invert-colors</v-icon>
                      </v-btn>
                    </template>
                  </color-picker>
                </div>

                <v-checkbox
                  label="粗体"
                  v-show="category.fontBold!== undefined"
                  type="number"
                  v-model="category.fontBold"
                ></v-checkbox>

                <v-checkbox
                  label="斜体"
                  v-show="category.fontItalic!== undefined"
                  type="number"
                  v-model="category.fontItalic"
                ></v-checkbox>
                <v-slider
                  label="透明度"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  style="width:420px"
                  v-show="category.opacity!== undefined"
                  v-model="category.opacity"
                ></v-slider>
                <v-slider
                  label="圆角"
                  :min="0"
                  :max="60"
                  :step="1"
                  :show-input="true"
                  style="width:420px"
                  v-show="category.radius!== undefined"
                  v-model="category.radius"
                ></v-slider>
                <v-text-field
                  label="长度"
                  type="number"
                  style="width:80px"
                  v-show="category.height!== undefined"
                  v-model="category.height"
                ></v-text-field>
                <v-text-field
                  label="宽度"
                  type="number"
                  style="width:80px"
                  v-show="category.width!== undefined"
                  v-model="category.width"
                ></v-text-field>
              </v-form>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import "jsoneditor/dist/jsoneditor.min.css";
import _ from "lodash";
import Http from "~/api/common";
import Parse from "parse";
import ColorPicker from "../../components/ColorPicker";
import { TemplateMaker } from "~/map";
import { mapGetters } from "vuex";
import systemColors from "../../store/predefine/colors";
import systemFonts from "../../store/predefine/fonts";
import JsonEdtior from "jsoneditor";

const StyleClass = Parse.Object.extend("style");
const shapesApi = Http.create("style");
const styleProperties = {
  fill: "#ffff",
  opacity: 1,
  radius: 10,
  stroke: "#9999",
  strokeWidth: 1,
  fontColor: "#3339",
  fontSize: 14,
  fontBold: false,
  fontItalic: false,
  width: 80,
  height: 80
};

export default {
  components: {
    ColorPicker
  },
  data() {
    return {
      viewMode: "editor",
      editorMode: "tree",
      rootStyle: null,
      categoryStyles: null,
      selectStyle: null,
      systemFonts,
      systemColors,

      jsonEditor: null
    };
  },
  watch: {
    editorMode() {
      if (this.jsonEditor) {
        this.jsonEditor.setMode(this.editorMode);
      }
    },
    viewMode(current, previousValue) {
      if (this.viewMode === "editor") {
        if (this.jsonEditor) {
          this.jsonEditor.set(this.categoryStyles);
        } else {
          this.$nextTick(() => {
            this.jsonEditor = new JsonEdtior(this.$refs.jsonEditor, {
              onChange: () => {
                this.categoryStyles = this.jsonEditor.get();
              }
            });

            this.jsonEditor.set(this.categoryStyles);
          });
        }
      }
    },
    selectStyle(value) {
      if (this.selectStyle) {
        var categoryStyles = _.chain(TemplateMaker.categoryStyle)
          .reduce((result, categoryStyle, categoryName) => {
            result[categoryName] = _.defaultsDeep(
              _.pick(
                this.selectStyle.model[categoryName],
                _.keys(categoryStyle)
              ),
              _.pick(categoryStyle, _.keys(categoryStyle))
            );

            return result;
          }, {})
          .value();

        this.name = this.selectStyle.name;
        this.isDefault = this.selectStyle.isDefault;
        this.rootStyle = _.defaultsDeep(this.selectStyle.model.root, {
          background: "#fff",
          meshColor: "#3333",
          ruleColor: "#333"
        });

        this.categoryStyles = categoryStyles;

        if (this.jsonEditor) {
          this.jsonEditor.set(this.selectStyle);
        } else {
          this.$nextTick(() => {
            this.jsonEditor = new JsonEdtior(this.$refs.jsonEditor, {
              onChange: () => {
                this.categoryStyles = this.jsonEditor.get();
              }
            });

            this.jsonEditor.set(this.categoryStyles);
          });
        }
      } else {
        this.name = null;
        this.isDefault = null;
        this.rootStyle = null;
        this.categoryStyles = null;
      }
    }
  },
  methods: {
    async getData() {
      this.$store.dispatch("style/getList");
    },
    async save() {
      try {
        this.$store.dispatch("style/update", {
          id: this.selectStyle.objectId,
          name: this.name,
          isDefault: this.isDefault,
          model: { root: this.rootStyle, ...this.categoryStyles }
        });

        this.$message.success("已保存");
      } catch ({ code, message }) {
        this.$message.error(message);
      }
    },
    async remove(style) {
      await this.$store.dispatch("style/remove", style.id);
      this.selectStyle = null;
      this.$message.success("已删除");
    },
    async create() {
      var style = await this.$store.dispatch("style/create", {
        name: "新主题",
        model: {}
      });

      this.selectStyle = style;
    },
    setEditorData(style) {
      if (this.jsonEditor) {
        this.jsonEditor.set(style.model);
      }
    }
  },
  computed: {
    ...mapGetters({
      list: "style/list"
    })
  },
  mounted() {
    this.getData();
  }
};
</script>
<style lang="scss" scoped>
</style>


