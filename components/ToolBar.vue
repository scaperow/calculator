<template>
  <v-toolbar flat class="grey lighten-5 grey lighten-5">
    <v-toolbar-items>
      <v-btn small text :disabled="!canUndo" v-if="allowUndo" @click="()=>commander.undo()">撤销</v-btn>
      <v-btn small text :disabled="!canRedo" v-if="allowRedo" @click="()=>commander.redo()">重做</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.copySelection()"
        v-if="allowCopy"
        :disabled="!canCopy"
      >复制</v-btn>
      <v-btn small text @click="()=>commander.cutSelection()" v-if="allowCut" :disabled="!canCut">剪切</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.pasteSelection()"
        :disabled="!canPaste"
        v-if="allowPaste"
      >粘贴</v-btn>
      <!-- <v-btn small text icon=" fa fa-paste"
              @click="()=>commander.pasteSelection()"
              v-if="allowCeiling">上移</v-btn>
      <v-btn small text icon=" fa fa-paste"
              @click="()=>commander.pasteSelection()"
      v-if="allowFloor">下移</v-btn>-->
      <v-btn
        small
        text
        @click="()=>commander.groupSelection()"
        v-if="allowMerge"
        :disabled="!canMerge"
      >组合</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.ungroupSelection()"
        :disabled="!canSplit"
        v-if="allowSplit"
      >拆解</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.ungroupSelection()"
        :disabled="!canSplit"
        v-if="allowSplit"
      >锁定</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.canCollapseTree()"
        :disabled="!canCollapseTree"
        v-if="allowCollapse"
      >展开</v-btn>
      <v-btn
        small
        text
        @click="()=>commander.expandTree()"
        :disabled="!canExpandTree"
        v-if="allowExpand"
      >折叠</v-btn>
      <v-menu :close-on-content-click="false" :nudge-width="200" offset-x>
        <template v-slot:activator="{ on }">
          <v-btn
            small
            text
            slot="reference"
            :disabled="!commander.canResetZoom"
            v-if="allowAction('zoom')"
            v-on="on"
          >缩放</v-btn>
        </template>
        <v-slider
          :min="-200"
          :max="200"
          :step="10"
          @change="handleZoom"
          v-model="zoomScale"
          :format-tooltip="(val)=>parseInt(val/2) + '%'"
        ></v-slider>
        <v-card>
          <div class="text-right">
            <v-btn small text class="text" v-show="zoomScale !== 100" @click="zoomScale = 100">重置</v-btn>
          </div>
        </v-card>
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import Go from "gojs";
import { mapGetters } from "vuex";
import { TemplateMaker } from "~/map";
import ShapeBar from "./ShapeBar";
import FileSaver from "file-saver";
import Vue from "vue";
import Parse from "parse";
import _ from "lodash";

let WorksClass = Parse.Object.extend("works");

export default {
  computed: {
    ...mapGetters({
      map: "go/map",
      mapData: "go/mapData"
    }),
    commander() {
      return _.get(this.map, "canvas.commandHandler") || null;
    },
    actionList() {
      return _.get(this.map, "allowActions") || null;
    }
  },
  props: {},
  data() {
    return {
      allowRedo: false,
      allowUndo: false,
      allowCopy: false,
      allowCut: false,
      allowPaste: false,
      allowMerge: false,
      allowSplit: false,
      allowCeiling: false,
      allowFloor: false,
      allowCollapse: false,
      allowExpand: false,

      canRedo: false,
      canUndo: false,
      canCopy: false,
      canCut: false,
      canPaste: false,
      canMerge: false,
      canSplit: false,
      canCeiling: false,
      canFloor: false,
      canCollapse: false,
      canExpand: false,

      zoomScale: 100
    };
  },
  watch: {
    map(map) {
      if (map) {
        map.addMapListener("ChangedSelection", this.listener);
        map.canvas.addDiagramListener("Modified", this.listener);
        map.canvas.addDiagramListener("SelectionGrouped", this.listener);
        map.canvas.addDiagramListener("ClipboardChanged", this.listener);
        map.canvas.addDiagramListener("ClipboardPasted", this.listener);

        this.setAllowAction();
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
    // }
  },
  methods: {
    listener(event) {
      if (event.name === "SelectionGrouped") {
        if (event.subject instanceof go.Group) {
          var counter = 1;
          this.map.canvas.nodes.each(node => {
            if (node instanceof go.Group) {
              counter++;
            }
          });

          event.subject.data.text = "分组";
          event.subject.updateTargetBindings();
          //this.map.canvas.model.setKeyForNodeData(event.subject.data, `分组${counter}`)
        }
      }

      this.setActionStatus(event.name);
    },
    handleZoom() {},
    handleImport() {
      this.$refs.importFile.click();
    },
    handleSelectFile() {
      var filePath = this.$refs.importFile.value;

      if (filePath) {
        var reader = new FileReader();
        reader.onload = () => {
          var text = reader.result;

          try {
            this.canvas.model = Go.Model.fromJson(JSON.parse(text));
            this.$refs.importFile.value = null;
            this.$message.success("导入成功");
          } catch (error) {
            this.$refs.importFile.value = null;
            this.$message.error("文件内容错误, 无法导入");
          }
        };

        reader.onerror = error => {
          this.$message.error("读取文件时发生错误");
          this.$refs.importFile.value = null;
          throw error;
        };

        reader.onabort = () => {
          this.$refs.importFile.value = null;
          this.$message.error("导入被中止");
        };

        reader.readAsText(this.$refs.importFile.files[0]);
      }
    },
    allowAction(actionName) {},
    canAction(actionName) {},
    setAllowAction() {
      this.allowRedo = _.includes(this.actionList, "redo");
      this.allowUndo = _.includes(this.actionList, "undo");
      this.allowCopy = _.includes(this.actionList, "copy");
      this.allowCut = _.includes(this.actionList, "cut");
      this.allowPaste = _.includes(this.actionList, "paste");
      this.allowMerge = _.includes(this.actionList, "merge");
      this.allowSplit = _.includes(this.actionList, "split");
      this.allowCeiling = _.includes(this.actionList, "celiling");
      this.allowFloor = _.includes(this.actionList, "floor");
      this.allowCollapse = _.includes(this.actionList, "collapse");
      this.allowExpand = _.includes(this.actionList, "expand");
    },
    setActionStatus(eventName) {
      switch (eventName) {
        default:
          this.canCopy = this.commander.canCopySelection();
          this.canCut = this.commander.canCutSelection();
          this.canPaste = this.commander.canPasteSelection();
          this.canUndo = this.commander.canUndo();
          this.canRedo = this.commander.canRedo();
          this.canMerge = this.commander.canGroupSelection();
          this.canSplit = this.commander.canUngroupSelection();
          this.canCollapse = this.commander.canCollapseTree();
          this.canExpand = this.commander.canExpandTree();
      }
    }
  }
};
</script>
<style lang="scss" >
@import "~/assets/variables.scss";

section.tool-bar {
  // background: #fcfcf9;
  // transition: all 0.3s;
  // padding: 12px 24px;

  // border-bottom: solid 1px #ebeef5;
}
</style>
