<template>
  <div>
    <v-card
      v-for="(organization,index) in list"
      :key="index"
      style="width:300px;display:inline-block;margin:12px;"
    >
      <v-card-text>
        <v-card-title>{{organization.objectId}}</v-card-title>
        <v-text-field v-model="organization.name" @blur="save(organization)"></v-text-field>
        <p>
          <v-checkbox-group v-model="organization.map" @change="save(organization)">
            <v-checkbox label="MINDMAP">思维导图</v-checkbox>
            <v-checkbox label="FLOWCHART">流程图</v-checkbox>
          </v-checkbox-group>
        </p>
        <p>
          <v-checkbox label="默认展开" @change="save(organization)" v-model="organization.isExpand"></v-checkbox>
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import Parse from "parse";
const OrganizationClass = new Parse.Object.extend("organization");

export default {
  data() {
    return {
      listObjects: [],
      list: [],
      current: null,
      name: null,
      maps: []
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
          org.map = org.map || [];
          org.name = org.name || "";

          return org;
        })
        .value();
    },
    async save({ name, map, isExpand, objectId }) {
      var object = _.find(this.listObjects, { id: objectId });

      if (!_.isEmpty(object)) {
        if (
          object.get("name") != name ||
          !_.isEqual(object.get("map"), map) ||
          object.get("isExpand") != isExpand
        ) {
          object.set("name", name);
          object.set("map", map);
          object.set("isExpand", isExpand);

          try {
            await object.save();

            this.$message.success("已保存");
          } catch (error) {
            this.$message.error(error.message);
          }
        }
      }
    }
  }
};
</script>

