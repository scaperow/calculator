<template>
  <section class="file-list d-flex flex-grow-1">
    <!-- <div style="margin-bottom:16px" class="flex-grow-0">
      <div class="d-flex align-item-center">
        <v-btn color="primary" text @click.stop="backFolder(-1)">{{rootName}}</v-btn>
        <v-icon v-show="folderPath.length > 0">mdi-menu-right</v-icon>

        <div v-if="showBreadcrumbs" class="d-flex">
          <div v-for="(folder,index) in folderPath" :Key="index">
            <v-btn
              :color="index + 1 === folderPath.length?'':'primary'"
              @click.stop="backFolder(index)"
              :disabled="index + 1 === folderPath.length"
              text
            >{{folder.name}}</v-btn>

            <v-icon v-show="index + 1 < folderPath.length">mdi-menu-right</v-icon>
          </div>
        </div>
        <v-divider v-if="allowCreateFolder" vertical class="ma-2"></v-divider>
        <v-btn v-if="allowCreateFolder" text @click="createFolder" color="secondary">
          <v-icon>mdi-folder-plus</v-icon>创建文件夹
        </v-btn>
      </div>
    </div>-->
    <div class=" d-flex flex-row flex-grow-1 flex-wrap align-content-start">
      <div v-for="(workItem,index) in list" :key="index" >
        <component
          :is="workItem.isFolder ? 'folder-item':'document-item'"
          :model="workItem"
          @open="open(workItem,index)"
          @rename="rename(workItem,index)"
          @remove="remove(workItem,index)"
          @share="share(workItem.objectId)"
          @remove_forever="removeForever(workItem,index)"
          @recovery="recovery(workItem)"
          @move_to="moveTo(workItem)"
          @copy_to="copyTo(workItem)"
          @copy="copyTo(workItem,true)"
        />
      </div>
      <v-card
        class="align-self-center"
        flat
        max-width="320"
        style="margin:auto"
        v-show="list.length === 0 && !loading"
      >
        <v-card-text class="info--text">
          <slot name="empty-message">此处毫无进展 ~</slot>
        </v-card-text>
      </v-card>
    </div>
    <share-modal ref="shareModal"></share-modal>
    <create-modal ref="createModal"></create-modal>
    <folder-select ref="folderSelect" :multiple="false"></folder-select>
    <folder-select ref="folderManySelect" :multiple="true"></folder-select>
  </section>
</template>
<script>
import Parse from "parse";
import Http from "~/api/common";
import { mapGetters, mapState } from "vuex";
import NanoId from "nanoid";
import ShareModal from "./Share";
import CreateModal from "./FileCreator";
import DocumentItem from "./Document";
import FolderItem from "./FoldCard";
import FolderSelect from "./FolderSelect";
const ShareClass = Parse.Object.extend("share");
const WorksClass = Parse.Object.extend("works");
const WorksApi = Http.create("works");
const ShareApi = Http.create("share");
const { NUXT_ENV_SITE_DOMAIN } = process.env;
function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported("copy")
  ) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export default {
  props: {
    showBreadcrumbs: {
      type: Boolean,
      default: true
    },
    allowCreateFolder: {
      type: Boolean,
      default: true
    },
    rootName: String
  },
  computed: {
    ...mapGetters({
      user: "user/user",
      list: "works/list"
    })
  },
  components: {
    ShareModal,
    CreateModal,
    DocumentItem,
    FolderItem,
    FolderSelect
  },
  data() {
    return {
      folderName: "新建文件夹",
      isSavingPassword: false,
      pageIndex: 0,
      pageSize: 10,
      worksTotal: 0,
      loading: false,
      isCreating: false,
      isSharing: false
    };
  },
  watch: {},
  methods: {
    getCurrentFolder() {
      return _.last(this.folderPath);
    },
    open(works) {
      this.openDocument(works);
    },
    openDocument(document) {
      this.$router.push("/map?id=" + document.objectId);
    },
    async copyTo(file, isCurrentFolder) {
      var folders = [];

      try {
        folders = await this.$refs.folderManySelect.open();
      } catch (error) {
        folders = null;
      }

      if (!_.isEmpty(folders)) {
        try {
          this.$store.dispatch("works/copy", {
            fileId: file.objectId,
            folderIds: _.map(folders, folder => folder && folder.objectId)
          });
        } catch (error) {
          this.$catch(error);
        }
      }
    },
    async moveTo(workItem) {
      var folders = [];
      var folder = null;

      try {
        folders = await this.$refs.folderSelect.open();
        folder = _.first(folders);
      } catch (error) {
        folders = null;
      }

      if (!_.isEmpty(folder)) {
        try {
          this.$store.dispatch("works/move", {
            fileId: workItem.objectId,
            folderId: folder.objectId
          });
        } catch (error) {
          this.$catch(error);
        }
      }
    },
    onCreate({ id }) {
      this.$router.push({
        name: "map",
        params: {
          id
        }
      });
    },
    FileCreator() {
      this.$refs.createModal.open();
    },

    async share(id) {
      this.$refs.shareModal.open(id);
    },
    async rename({ objectId, name }) {
      var newly = null;

      try {
        newly = await this.$prompt("请输入新名称", "重命名", {
          label: "新名称",
          value: name,
          rules: [
            this.$validate("isNotEmpty"),
            this.$validate("isCommonName"),
            this.$validate("isLength", { min: 3, max: 28 })
          ]
        });
      } catch (error) {}

      if (newly) {
        this.loading = true;

        try {
          this.$store.dispatch("works/update", {
            id: objectId,
            name: newly
          });
        } catch (error) {
          this.$catch(error);
        } finally {
          this.loading = false;
        }
      }
    },
    async remove(model, index) {
      var isDelete = true;

      try {
        if (model.isFolder === true) {
          await this.$confirm(
            "该操作会将文件夹内的所有内容一并删除, 是否继续?",
            "",
            {
              confirmButtonText: "是",
              cancelButtonText: "否"
            }
          );
        } else {
          await this.$confirm("是否确认删除?", "", {
            confirmButtonText: "是",
            cancelButtonText: "否"
          });
        }
      } catch (error) {
        isDelete = false;
      }

      if (isDelete) {
        this.loading = true;

        try {
          await this.$store.dispatch("works/remove", model.objectId);
        } catch (error) {
          throw error;
        } finally {
          this.loading = false;
        }
      }
    },
    async removeForever(model, index) {
      this.$confirm("删除后将无法恢复, 是否继续?", null, {
        confirmButtonText: "是",
        cancelButtonText: "否"
      }).then(async () => {
        this.loading = true;

        try {
          await this.$store.dispatch("works/remove", model.objectId);
        } catch (error) {
          this.$catch(error);
        } finally {
          this.loading = false;
        }
      });
    },
    async recovery(model, index) {
      this.loading = true;

      try {
        await this.$store.dispatch("works/recovery", model.objectId);
      } catch (error) {
        this.$catch(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~/assets/variables.scss";

section.file-list {
  .v-card {
    margin-right: 12px;
    .v-image {
      transition: all 0.3s;
      cursor: pointer;

      &.document {
        background: #42a5f5;
        &:hover {
          transform: scale(1.2, 1.2);
        }
      }

      &.folder {
        &:hover {
          filter: drop-shadow(5px 5px 10px #ccc);
        }
      }
    }
  }

  .badge__badge {
    .v-icon {
      display: block !important;
    }
  }

  .share {
    padding: 0 16px;
  }
}
</style>



