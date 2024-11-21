<template>
  <div>
    <v-row>
      <v-card max-width="300" color="success" dark>
        <v-card-title>
          <h4>
            <v-icon>mdi-plus</v-icon>新建
          </h4>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" label="name"></v-text-field>
          <v-textarea v-model="map" label="map"></v-textarea>
          <v-text-field v-model="category" label="category"></v-text-field>
          <p>
            <v-checkbox v-model="isExpand" label="isExpand"></v-checkbox>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="save">保存</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-for="(organization,index) in list" :key="index" max-width="300">
        <v-card-title>
          <h4>{{organization.objectId}}</h4>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="organization.name" @blur="save(organization)" label="name"></v-text-field>
          <v-textarea v-model="organization.map" @blur="save(organization)" label="map"></v-textarea>
          <v-text-field v-model="organization.category" @blur="save(organization)" label="category"></v-text-field>
          <p>
            <v-checkbox @change="save(organization)" v-model="organization.isExpand" label="默认展开"></v-checkbox>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="error"
            @click="setDisable(organization.objectId,true)"
            v-if="!organization.isDisable"
          >禁用</v-btn>
          <v-btn
            text
            color="success"
            @click="setDisable(organization.objectId,false)"
            v-if="organization.isDisable === true"
          >启用</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </div>
</template>
<script>
import Parse from "parse";
const OrganizationClass = new Parse.Object.extend("organization");

export default {
  data() {
    return {
      isExpand: false,
      listObjects: [],
      list: [],
      current: null,
      name: null,
      maps: [],
      map: []
    };
  },

  created() {
    this.getList();
  },

  methods: {
    async getList() {
      this.listObjects = await new Parse.Query(OrganizationClass).find();
      this.list = _.chain(this.listObjects)
        .map(object => object.toJSON())
        .map(org => {
          return {
            objectId: org.objectId,
            map: (org.map || []).join(","),
            category: org.category || "形状",
            name: org.name || "",
            isExpand: org.isExpand
          };
        })
        .value();
    },
    async setDisable(id, isDisable) {
      var object = _.find(this.listObjects, { id });
      if (object) {
        try {
          if (isDisable) {
            object.set("isDisable", true);
          } else {
            object.unset('isDisable')
          }
          this.$message.success(isEnable ? "已启用" : "已禁用");
          this.getList();
        } catch (error) {
          this.$message.error(error.message);
        }
      }
    },
    async remove(id) {
      var object = _.find(this.listObjects, { id });
      if (object) {
        try {
          await object.destroy();
          this.$message.success("已删除");
          this.getList();
        } catch (error) {
          this.$message.error(error.message);
        }
      }
    },
    async save({ name, map, category, isExpand, objectId }) {
      var object = _.find(this.listObjects, { id: objectId });

      if (!_.isEmpty(object)) {
        if (
          !_.isEqual(object.get("name"), name) ||
          !_.isEqual(object.get("map"), map.split(",")) ||
          !_.isEqual(object.get("category"), category) ||
          !_.isEqual(object.get("isExpand"), isExpand)
        ) {
          object.set("name", name);
          object.set("map", map.split(","));
          object.set("category", category);
          object.set("isExpand", isExpand);

          try {
            await object.save();

            this.$message.success("已保存");
          } catch (error) {
            this.$message.error(error.message);
          }
        }
      } else {
        var model = new OrganizationClass();
        model.set("name", this.name);
        model.set("map", this.map.split(","));
        model.set("category", this.category);
        model.set("isExpand", this.isExpand);

        try {
          await model.save();
          this.$message.success("已保存");
          this.name = null;
          this.getList();
        } catch (error) {
          this.$mesage.error(error.message);
        }
      }
    }
  }
};
</script>

