<template>

  <div>

    <v-dialog :visible.sync="isShowing">
      <v-form v-model="shapeModel">
        <div label="Name">
          <v-text-field v-model="shapeModel.name"></v-text-field>
        </div>

        <div label="Category">
          <div>
            <v-radio v-model="shapeModel.category"
                     :label="category"
                     v-for="(category,index) in categories"
                     :key="index">{{category}}</v-radio>
            <v-text-field style="width:180px;"
                          placeholder="New Category"
                          v-model="shapeModel.category"></v-text-field>
          </div>
        </div>
        <div label="Shape Category">
          <v-checkbox-group v-model="checkCategories">
            <v-checkbox v-for="(item,index) in shapeCategories"
                        :label="item.id"
                        :key="index">{{item.attributes.name}}</v-checkbox>
          </v-checkbox-group>
        </div>

        <div label="Meta Data">
          <v-text-field type="textarea"
                        v-model="shapeMetadata"></v-text-field>
        </div>

        <div>
          <v-btn color="primary"
                 @click="handleSaveShape">Save</v-btn>
          <v-btn @click="shapeModel = {}">Reset</v-btn>
        </div>

        <div>
          <v-text-field v-model="createCategoryName"></v-text-field>
          <v-btn type="text"
                 @click="handleSaveCategory">Create new Category</v-btn>
        </div>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import Parse from 'parse'
import Http from '~/api/common.js'
import _ from 'lodash'
import { mapGetters } from 'vuex';

const ShapeClass = Parse.Object.extend('shape')
const ShapeQuery = new Parse.Query(ShapeClass)
const CategoryClass = Parse.Object.extend('shapeCategory')
const ShapeApi = Http.create('shape')
const ShapeCategoryApi = Http.create('shapeCategory')
const { NUXT_ENV_OSS_URL } = process.env

export default {
  computed: {
    ...mapGetters({ user: 'user/user' })
  },
  data () {
    return {
      shapeMetadata: null,
      shapeCategories: [],
      checkCategories: [],
      shapeModel: {},
      isShowing: false,
      createCategoryName: null,
      newCategoryName: null,
      selectCategories: [],
      categories: []
    }
  },
  watch: {
    checkCategories (val) {
      this.shapeModel.shapeCategory = _.filter(this.shapeCategories, (category) => _.includes(val, category.id))
    },
    shapeMetadata (val) {
      try {
        this.shapeModel.model = JSON.parse(val)
      } catch (error) { }
    }
  },

  methods: {
    async open () {
      this.categories = await Parse.Cloud.run('getCategoryList')
      this.shapeCategories = await new Parse.Query(CategoryClass).find()
      this.isShowing = true
    },
    handleCreateCategory () {
      this.isCreateCategory = true
    },
    async handleSaveShape () {
      if (_.isEmpty(this.shapeModel.model)) {
        return this.$message.error('Invalid json data');
      }

      await ShapeApi.save(this.shapeModel)

      this.$message.success('Success !');
    },
    async handleSaveCategory () {
      await ShapeCategoryApi.save({
        name: this.createCategoryName
      })

      this.shapeCategories = await new Parse.Query(CategoryClass).find()
      this.$message.success('Success！');
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
