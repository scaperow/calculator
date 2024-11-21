<template>
  <section class="welcome">
    <div class="content">
      <div width="260px" class="left-side">
        <div>
          <div class="logo dark" >
            <label>蓝图巴巴</label>
          </div>
          <!-- <v-divider /> -->
          <div class="mt-12 mb-6">
            <v-menu bottom offset-y>
              <template v-slot:activator="{on}">
                <v-btn v-on="on" large depressed block rounded color="primary">
                  <v-icon class="mr-2">mdi-plus</v-icon>创建蓝图
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="map in maps" :key="map.objectId" @click="createFile(map)">
                  <v-list-item-avatar>
                    <v-icon>{{map.icon}}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>{{map.label}}</v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <div>
            <v-list color="grey lighten-4">
              <v-subheader>
                <v-row>
                  <v-col>文件夹列表</v-col>
                  <v-col class="text-right">
                    <v-tooltip bottom>
                      <template v-slot:activator="{on}">
                        <v-btn color="secondary" text icon v-on="on" @click="createFolder">
                          <v-icon>mdi-plus-circle</v-icon>
                        </v-btn>
                      </template>
                      <span>创建文件夹</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-subheader>
              <v-list-item-group color="primary">
                <v-list-item
                  nuxt
                  :to="`/desktop/${folder.objectId}`"
                  v-for="(folder,index) in folderList"
                  :key="index"
                >
                  <v-list-item-icon>
                    <v-icon class="mr-2">mdi-folder</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>{{folder.name}}</v-list-item-content>
                  <v-list-item-action>
                    <v-menu offset-y>
                      <template v-slot:activator="{on:{click}}">
                        <v-btn @click.prevent="click" icon max-width="32" max-height="32">
                          <v-icon color="grey">mdi-menu</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="rename(folder)">
                          <v-list-item-icon>
                            <v-icon>mdi-folder-edit-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>重命名</v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="remove(folder)">
                          <v-list-item-icon>
                            <v-icon>mdi-folder-remove-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>删除</v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item nuxt to="/desktop/recycle">
                  <v-list-item-icon>
                    <v-icon color class="mr-2">mdi-trash-can</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>回收站</v-list-item-content>
                </v-list-item>
                <!-- <v-list-item nuxt to="/welcome/mine">
                  <v-icon class="mr-2">mdi-file-document</v-icon>全部作品
                </v-list-item>
                <v-list-item nuxt to="/welcome/share">
                  <v-icon class="mr-2">mdi-share</v-icon>公开的作品
                </v-list-item>
                <v-list-item nuxt to="/welcome/private">
                  <v-icon class="mr-2">mdi-shield-account</v-icon>私有的作品
                </v-list-item>
                <v-list-item nuxt to="/welcome/team">
                  <v-icon color class="mr-2">mdi-star</v-icon>收藏的作品
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item nuxt to="/welcome/recycle">
                  <v-icon color class="mr-2">mdi-trash-can</v-icon>回收站
                </v-list-item>-->
              </v-list-item-group>
            </v-list>
          </div>
        </div>
      </div>
      <div class="list d-flex flex-column ">
        <div class="d-flex flex-row pt-4 pb-4 justify-space-between">
          <v-text-field
            style="max-width:480px;"
            label="搜索标题/文件夹名称"
            filled
            clearable
            hide-details
            @click:append-outer="search"
            @keydown.enter="search"
            @click:clear="cancelSearch"
            rounded
            v-model="keyword"
          >
            <template slot="label">
              输入名称搜索文件/文件夹
              <v-icon>mdi-file-find</v-icon>
            </template>
          </v-text-field>
          <user-avatar style="width:45px;height:45px"></user-avatar>
        </div>
        <keep-alive>
          <nuxt-child keep-alive></nuxt-child>
        </keep-alive>
      </div>
    </div>
    <create-modal ref="createModal"></create-modal>
  </section>
</template>
<script>
import UserAvatar from "~/components/UserAvatar";
import CreateModal from "~/components/FileCreator";
import { mapGetters } from "vuex";
import FileList from "~/components/FileList";

export default {
  middleware: "authenticated",
  components: {
    UserAvatar,
    CreateModal,
    FileList
  },
  computed: {
    stateParams() {
      return {};
    },
    ...mapGetters({
      searchList: "works/searchList",
      folderList: "works/folders",
      user: "user/user",
      maps: "maps/list",
      folder: "works/folder"
    })
  },
  activated() {},
  created() {
    //this.$router.push("/welcome/mine");
    this.$store.dispatch("works/getFolders", {
      folderId: this.$
    });
    this.$store.dispatch("maps/getList");
  },
  data() {
    return {
      keyword: null
    };
  },
  head() {
    return {
      title: "蓝图巴巴",
      meta: [{ roles: ["user"] }]
    };
  },
  methods: {
    cancelSearch() {
      if (this.$route.name === "welcome-search") {
        this.$router.go(-1);
      }
    },
    ok() {
      alert("ok");
    },
    async createFile({ name, label, style, raw }) {
      var newly = null;

      if (_.isEmpty(style)) {
        style = await this.$store.dispatch("style/getPredefine");
      }

      var model = {
        map: name,
        name: `新建${label}`,
        style,
        raw,
        parentId: _.get(this.folder, "objectId")
      };

      try {
        newly = await this.$store.dispatch("works/create", model);
      } catch (error) {
        this.$catch(error);
      }

      if (newly) {
        this.$router.push("/map?id=" + newly.id);
      }
    },
    async search() {
      if (this.keyword) {
        if (this.$route.name === "welcome-search") {
          this.$router.replace("search?keyword=" + this.keyword);
        } else {
          this.$router.push("search?keyword=" + this.keyword);
        }
      }
    },
    async createFolder() {
      var folderName = null;
      try {
        folderName = await this.$prompt("请输入文件夹名称", "创建文件夹", {
          label: "文件夹名称",
          value: "新建文件夹",
          rules: [
            this.$validate("isNotEmpty"),
            this.$validate("isCommonName"),
            this.$validate("isLength", { min: 3, max: 28 })
          ]
        });
      } catch (error) {}

      if (folderName) {
        this.loading = true;

        let model = {
          name: folderName,
          isFolder: true,
          parentId: _.get(this.folder, "objectId")
        };

        try {
          await this.$store.dispatch("works/create", model);
        } catch (error) {
          this.$catch(error);
        } finally {
          this.loading = false;
        }
      }
    },
    async remove(model) {
      var isDelete = true;

      try {
        await this.$confirm(
          "该操作会将文件夹内的所有内容一并删除, 是否继续?",
          "",
          {
            confirmButtonText: "是",
            cancelButtonText: "否"
          }
        );
      } catch (error) {
        isDelete = false;
      }

      if (isDelete) {
        this.loading = true;

        try {
          await this.$store.dispatch("works/removeFolder", model.objectId);
        } catch (error) {
          throw error;
        } finally {
          this.loading = false;
        }
      }
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
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/variables.scss";

section.welcome {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;

    .left-side {
      width: 300px;
      min-width: 300px;
      background: $--background-color-base;
      position: relative;
      padding: 24px 16px;

      div.create-button {
        width: 100%;
        text-align: center;
        button {
          background: $--color-secondary;
          color: $--color-white;
          width: auto;
          border: none;
          font-size: 18px;
          height: 50px;
          line-height: 50px;
          border-radius: 50px;
          width: 50%;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: lighten($--color-secondary, 10%);
          }

          &:active {
            background: darken($--color-secondary, 10%);
          }
        }
      }

      .logo {
        margin-bottom: 32px;
      }

      .router {
        button {
          font-size: 12px;
          text-align: left;
          border: none;
          cursor: pointer;
          width: 100%;
          padding: 6px 12px;
          margin-bottom: 12px;
          background: transparent;
          border-radius: 4px;
          color: $--color-info;
          transition: all 0.3s;
          border: solid 1px transparent;

          i.fa {
            font-size: 16px;
            margin-right: 12px;
          }

          strong {
            font-size: 16px;
            font-weight: 400;
          }

          &.active {
            background: $--color-info;
            color: #fff;
          }

          &:not(.active):hover {
            background: #fff;
            color: $--color-info;
          }
        }
      }
    }

    .list {
      flex-grow: 1;
      padding: 32px;
      padding-top: 0;

      .header {
        display: flex;
        justify-content: center;
        align-items: center;
        background: $--color-white;
        margin-bottom: 16px;

        .center {
          flex-grow: 1;
        }

        .search {
          flex-grow: 1;
          padding: 24px 0;

          input[type="text"] {
            width: 400px;
            background: $--background-color-base;
            padding: 0 24px;
            border: none;
            transition: all 0.3s;
            border-radius: 35px;
            height: 48px;

            &:hover {
              background: darken($--background-color-base, 5%);
            }
          }
        }
      }
    }
  }
}
</style>
