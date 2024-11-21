<template>
  <v-dialog v-model="isVisible" max-width="480">
    <v-card>
      <v-card-title>{{title}}</v-card-title>
      <v-card-text>
        <v-text-field
          height="20"
          v-model="keyword"
          label="查找"
          rounded
          filled
          flat
          hide-details
          clearable
          clear-icon="mdi-close-circle-outline"
        ></v-text-field>
        <div class="ma-0 pa-2">
          <v-treeview
            style="min-height:480px"
            hoverable
            activatable
            item-key="objectId"
            item-text="name"
            v-model="selection"
            :search="keyword"
            :selectable="true"
            selection-type="independent"
            return-object
            :items="treeData"
          >
            <template v-slot:prepend="{ item, open,selected }">
              <v-icon color="#FFEB3B">{{ open ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
            </template>
          </v-treeview>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex flex-row-reverse">
        <v-btn text @click="cancel">取消</v-btn>
        <v-btn text color="primary" @click="sure">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import _ from "lodash";
import Parse from "parse";
import Http from "~/api/common";
import { mapGetters, mapState } from "vuex";
import NanoId from "nanoid";
import ShareModal from "./Share";
const WorksClass = Parse.Object.extend("works");
const WorksApi = Http.create("works");
const { NUXT_ENV_SITE_DOMAIN } = process.env;
function transformToTree(arr) {
  var nodes = {};
  return arr.filter(function(obj) {
    var id = obj["objectId"],
      parentId = obj["parentId"];

    nodes[id] = _.defaults(obj, nodes[id], { children: [] });
    parentId &&
      (nodes[parentId] = nodes[parentId] || { children: [] })["children"].push(
        obj
      );

    return !parentId;
  });
}
export default {
  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },
  watch: {
    visible() {
      if (this.visible !== this.isVisible) {
        this.isVisible = this.visible;
      }
    },
    isVisible() {
      if (this.isVisible) {
        this.selection = [];
        this.getData();
      }

      if (this.isVisible !== this.visible) {
        this.$emit("update:visible", this.isVisible);
      }
    },
    selection() {
      if (this.selection.length > 1 && !this.multiple) {
        this.selection = [this.selection[this.selection.length - 1]];
      }
    }
  },
  props: {
    value: {
      type: Array
    },
    selectId: {
      type: Array
    },
    visible: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: "选择文件夹"
    }
  },
  data() {
    return {
      resolve: null,
      reject: null,
      singleSelect: null,
      isVisible: false,
      selection: [],
      keyword: null,
      list: [],
      treeData: []
    };
  },
  methods: {
    open() {
      this.isVisible = true;

      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    checkSingle(item) {
      var exists = _.find(this.selection, i => i.objectId === item.objectId);
      if (exists) {
        this.selection = _.pullAllBy(this.selection, [
          { objectId: item.objectId }
        ]);
      } else {
        this.selection.push(item);
      }
    },
    cancel() {
      this.isVisible = false;
      this.reject && this.reject();
      this.reject = null;
    },
    sure() {
      this.$emit("change", this.selection);
      this.isVisible = false;
      this.resolve && this.resolve(this.selection);
      this.resolve = null;
    },
    // updateSelection() {
    //   if (!_.isEmpty(this.selectId) && !_.isEmpty(this.list)) {
    //     selection = _.compact(
    //       _.map(_.flatten([this.selectId]), id => {
    //         return _.find(this.list, {
    //           objectId: id
    //         });
    //       })
    //     );

    //     this.selection = [...this.selection, ...selection];
    //   }
    // },
    async getData() {
      var list = await new Parse.Query(WorksClass)
        .equalTo("isFolder", true)
        .doesNotExist("isDelete")
        .find();

      this.treeData = transformToTree(_.map(list, item => item.toJSON()));
    }
  }
};
</script>
<style lang="scss" scoped>
</style>