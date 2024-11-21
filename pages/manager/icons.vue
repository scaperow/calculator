<template>
  <v-container>
    <v-row v-if="categories">
      <v-col cols="2">
        <h4>所有分类 [{{categories.length}}]</h4>
        <v-divider></v-divider>
        <!-- <v-text-field v-model="categoryName"></v-text-field>
        <v-btn text color="primary" @click="createCategory">新分类</v-btn>-->

        <v-list dense>
          <v-list-item
            v-for="(category,index) in categories"
            :key="index"
            @click="currentCategory = category.objectId;getList(category.objectId)"
          >
            <v-list-item-content>{{category.name}}</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="10" v-if="icons">
        <v-card>
          <v-card-title>批量插入</v-card-title>
          <v-card-text>
            <v-textarea placeholder="text:name" v-model="models"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="save">保存</v-btn>
          </v-card-actions>
        </v-card>
        <span
          v-for="(icon,index) in icons"
          :key="index"
          style="border:solid 1px #ccc"
          class="ma-2 pa-2"
        >
          <i
            style="font: normal normal normal 24px/1 'Material Design Icons'"
          >{{icon.model.text | iconText }}</i>

          <i>{{icon.name}}({{icon.model.text}})</i>
          <v-btn color="error" text @click="remove(icon.objectId)" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import _ from "lodash";
import Http from "~/api/common";
import Parse from "parse";
import { TemplateMaker } from "~/map";
import { mapGetters, mapActions } from "vuex";

export default {
  filters: {
    iconText(value) {
      return String.fromCodePoint(parseInt(value, 16));
    }
  },
  data() {
    return {
      models: null,
      currentCategory: null,
      name: null,
      model: null,
      isDefault: false
    };
  },
  methods: {
    save() {
      var models = _.chain(this.models.split("\n"))
        .map(singleline => singleline.split(":"))
        .filter(line => line.length > 1)
        .map(([text, name]) => {
          return { name, text, organization: this.currentCategory };
        })
        .value();

      this.createMany(models);
    },
    ...mapActions({
      getList: "icon/getList",
      createMany: "icon/createMany",
      update: "icon/update",
      remove: "icon/remove"
    })
  },
  computed: {
    ...mapGetters({
      icons: "icon/list",
      categories: "icon/categories"
    }),
    categoryStyle() {
      return _.chain(TemplateMaker.categoryStyle)
        .keys()
        .reduce((result, category) => {
          result[category] = _.get(this.model, category);

          return result;
        }, {})
        .value();
    }
  },
  mounted() {
    this.getList();
  }
};
</script>
<style lang="scss" scoped>
</style>


