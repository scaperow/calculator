<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <v-text-field clearable v-model="categoryKeyword"></v-text-field>
        <v-treeview
          :items="categoryMaps"
          item-key="label"
          item-text="label"
          :search="categoryKeyword"
          open-on-click
        >
          <template slot="label" slot-scope="{ item,leaf}">
            <a v-if="leaf" @click="selectId = item.label">{{ item.label }}</a>
            <span v-else>{{ item.label }}</span>
          </template>
        </v-treeview>
        <!-- <v-list>
          <v-list-item
            @click="selectMap = map"
            :color="selectMap && selectMap.objectId === map.objectId?'primary':''"
            v-for="(categoryMap,index) in categoryMap"
            :key="index"
          >
            <v-list-item-icon>
              <v-icon color="yellow" v-if="!map.cover">mdi-alert</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{map.label}}</v-list-item-content>
          </v-list-item>
        </v-list>-->
      </v-col>
      <v-col cols="10" v-if="selectMap">
        <h2>{{selectMap.label}}</h2>
        <v-card width="100%" flat>
          <v-card-title>CURRENT COVERT</v-card-title>
          <v-card-text>
            <v-img v-if="selectMap.cover" :src="selectMap.cover" width="200" height="200" contain></v-img>
            <v-card-text v-else>NO COVER</v-card-text>
          </v-card-text>
        </v-card>
        <v-card width="100%" flat>
          <v-card-title>FILE</v-card-title>

          <v-card-text v-if="file">
            <div :id="file.objectId" style="width:100%;height:500px"></div>
            <v-btn color="primary" @click="saveCover">SAVE COVER</v-btn>
            <v-btn color="primary" @click="reloadFile">RELOAD FILE</v-btn>
            <v-btn color="primary" @click="removeFile">REMOVE FILE</v-btn>
            <v-btn nuxt :to="`/map?id=${file.objectId}`" color="primary">EDIT ON NEW TAB</v-btn>
          </v-card-text>

          <v-card-text v-else>
            <v-btn @click="createFile()">CREATE FILE</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Parse from "parse";
import _ from "lodash";
import systemSetting from "~/store/predefine/setting";
import { Maps, MindMap, SequenceMap, FlowChart } from "../../map";
import { mapActions, mapGetters } from "vuex";

const WorksClass = Parse.Object.extend("works");

export default {
  data() {
    return {
      selectId: null,
      categoryKeyword: null,
      maper: null,
      file: null,
      fileObjects: []
    };
  },
  watch: {
    async file() {
      if (this.maper) {
        this.maper.unmount();
      }

      if (this.file) {
        this.setMaper(this.file);
      }
    },
    async selectMap() {
      if (this.selectMap) {
        this.setFile(this.selectMap.label);
      }
    }
  },
  computed: {
    ...mapGetters({
      maps: "maps/list",
      user: "user/user"
    }),
    selectMap() {
      if (this.maps) {
        return _.find(this.maps, { label: this.selectId });
      }
    },
    files() {
      if (this.fileObjects) {
        return _.map(this.fileObjects, file => file.toJSON());
      }

      return [];
    },
    categoryMaps() {
      return _.chain(this.maps || [])
        .reduce((result, map, index) => {
          _.each(map.category || ["[未命名]"], cat => {
            var item = _.find(result, { label: cat });

            if (_.isEmpty(item)) {
              item = {
                label: cat,
                children: []
              };

              result.push(item);
            }

            item.children.push(map);
          });

          return result;
        }, [])
        .value();
    }
  },
  created() {
    this.$store.dispatch("maps/getList");
    this.getMaps();
  },
  methods: {
    async saveCover() {
      var cover = null;
      try {
        cover = await this.maper.capture(Maps.Captures.BASE64);
      } catch (error) {
        this.$catch(error);
      }

      if (cover) {
        await this.$store.dispatch("maps/update", {
          ...this.selectMap,
          cover
        });
      }
    },
    async removeFile() {
      var file = _.find(this.fileObjects, { id: this.file.objectId });
      var index = _.indexOf(this.fileObjects, { id: this.file.objectId });
      if (file) {
        await file.destroy();
        this.fileObjects.splice(index, 1);
        this.file = null;
      }
    },
    async reloadFile() {
      var file = _.find(this.fileObjects, { id: this.file.objectId });
      var index = _.indexOf(this.fileObjects, { id: this.file.objectId });
      if (file) {
        file = await file.fetch();
      }

      this.fileObjects.splice(index, 1, file);
    },
    setFile(mapLabel) {
      this.file = _.find(this.files, { name: mapLabel });
    },
    async setMaper(file) {
      if (file) {
        this.maper = await this.$store.dispatch("go/createMap", file);

        this.$nextTick(() => {
          this.maper.mount(file.objectId, file.raw);
        });
      }
    },
    async createFile() {
      var folder = await this.getFolder();

      var model = {
        map: this.selectMap.name,
        name: this.selectMap.label,
        parentId: folder.id,
        style: this.selectMap.style,
        setting: this.selectMap.setting,
        raw: this.selectMap.raw
      };

      var file = await this.$store.dispatch("works/create", model);
      this.file = file.toJSON();
    },
    async getMaps() {
      var folder = await this.getFolder();

      var list = await new Parse.Query(WorksClass)
        .notEqualTo("isFolder", true)
        .notEqualTo("isDelete", true)
        .include("style")
        .equalTo("parentId", folder.id)
        .find();

      this.fileObjects = list;
    },
    async getFolder() {
      var folder = await new Parse.Query(WorksClass)
        .equalTo("isFolder", true)
        .notEqualTo("isDelete", true)
        .equalTo("name", "模板数据")
        .first();

      return folder;
    }
  }
};
</script>