<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="2">
          <v-list>
            <v-list-item
              v-for="(organization,index) in organizations "
              :class="organization === selectOrganization?' primary':''"
              :key="index"
              @click="selectOrganization = organization"
            >
              <v-list-item-content
                :class="organization === selectOrganization?'white--text':''"
              >{{organization.name}}</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="10">
          <v-card
            v-if="selectOrganization"
            color="success"
            dark
            width="240"
            style="display:inline-block"
          >
            <v-card-text>
              <v-textarea
                :value=" JSON.stringify(createModel.model)"
                @change="(model)=>createModel.model = JSON.parse(model)"
              ></v-textarea>
              <v-text-field label="category" v-model="createModel.category"></v-text-field>
              <v-text-field
                label="keywords"
                :value="(createModel.keyword || []).join(',')"
                @change="(keyword)=>createModel.keyword=keyword.split(',')"
              ></v-text-field>
              <v-textarea label="xml"></v-textarea>
              <v-checkbox label="allowDelete" v-model="createModel.allowDelete"></v-checkbox>
              <v-checkbox label="allowCreate" v-model="createModel.allowCreate"></v-checkbox>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text @click="createPart()">保存</v-btn>
            </v-card-actions>
          </v-card>

          <v-card
            v-for="(part,index) in parts"
            :key="index"
            width="240"
            style="display:inline-block"
          >
            <v-card-text>
              <v-textarea
                :value=" JSON.stringify(part.model)"
                @change="(model)=>part.model = JSON.parse(model)"
              ></v-textarea>
              <v-text-field label="category" v-model="part.category"></v-text-field>
              <v-text-field
                label="keywords"
                :value="(part.keyword || []).join(',')"
                @change="(keyword)=>part.keyword=keyword.split(',')"
              ></v-text-field>
              <v-textarea label="xml"></v-textarea>
              <v-checkbox label="allowDelete" v-model="part.allowDelete"></v-checkbox>
              <v-checkbox label="allowCreate" v-model="part.allowCreate"></v-checkbox>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" text @click="savePart(part)">保存</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import Parse from "parse";
import Http from "~/api/common.js";
import _ from "lodash";
import { mapGetters } from "vuex";
const OrganizationClass = new Parse.Object.extend("organization");
const ShapeClass = new Parse.Object.extend("shape");
const ShapeQuery = new Parse.Query(ShapeClass);
const CategoryClass = Parse.Object.extend("shapeCategory");
const ShapeApi = Http.create("shape");
const ShapeCategoryApi = Http.create("shapeCategory");
const { NUXT_ENV_OSS_URL } = process.env;

export default {
  computed: {
    ...mapGetters({ user: "user/user" }),
    organizations() {
      return _.chain(this.organizationObjects)
        .map(object => object.toJSON())
        .value();
    },
    parts() {
      return _.chain(this.partObjects)
        .map(object => object.toJSON())
        .value();
    }
  },
  data() {
    return {
      createModel: {
        category: "Shape",
        keywords: [],
        model: {},
        xml: null,
        allowDelete: true,
        allowCreate: true
      },
      organizationObjects: [],
      selectOrganization: null,
      partObjects: []
    };
  },
  watch: {
    selectOrganization(val) {
      this.fetchParts();
    }
  },

  methods: {
    async fetchParts() {
      this.partObjects = [];
      if (this.selectOrganization) {
        this.partObjects = await new Parse.Query(ShapeClass)
          .equalTo(
            "organization",
            _.find(this.organizationObjects, {
              id: this.selectOrganization.objectId
            })
          )
          .find();
      }
    },
    async open() {
      this.categories = await Parse.Cloud.run("getCategoryList");
      this.shapeCategories = await new Parse.Query(CategoryClass).find();
      this.isShowing = true;
    },
    handleCreateCategory() {
      this.isCreateCategory = true;
    },
    async handleSaveShape() {
      if (_.isEmpty(this.shapeModel.model)) {
        return this.$message.error("Invalid json data");
      }

      await ShapeApi.save(this.shapeModel);

      this.$message.success("Success !");
    },
    async handleSaveCategory() {
      await ShapeCategoryApi.save({
        name: this.createCategoryName
      });

      this.shapeCategories = await new Parse.Query(CategoryClass).find();
      this.$message.success("Success！");
    },
    async savePart(part) {
      var partObject = _.find(this.partObjects, { id: part.objectId });
      var index = _.indexOf(this.partObjects, partObject);

      if (partObject) {
        _.each(part, (value, key) => partObject.set(key, value));

        partObject.set(
          "organization",
          _.find(this.organizationObjects, {
            id: this.selectOrganization.objectId
          })
        );

        try {
          partObject = await partObject.save();
          this.partObjects.splice(index, 1, partObject);
        } catch (error) {
          this.$catch(error);
        }

        return partObject;
      }
    },
    async createPart() {
      var model = new ShapeClass();

      _.each(this.createModel, (value, key) => model.set(key, value));

      model.set(
        "organization",
        _.find(this.organizationObjects, {
          id: this.selectOrganization.objectId
        })
      );

      try {
        model = await model.save();
        this.partObjects.push(model)
      } catch (error) {
        this.$catch(error);
      }
    }
  },
  async created() {
    this.organizationObjects = await new Parse.Query(OrganizationClass).find();
  }
};
</script>
<style lang="scss" scoped>
</style>
