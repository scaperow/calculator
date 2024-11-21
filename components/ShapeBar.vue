<template>
  <section class="shape-bar" style="overflow-y:auto" v-if="categories">

    <organization-list
      :category="cat.value"
      v-for="(cat,index) in categories"
      :key="index"
      v-show="cat.value === category"
    ></organization-list>
  </section>
</template>

<script>
import OrganizationList from "./Organization";
import go from "gojs";
import { TemplateMaker, Maps, ActionList } from "~/map";
import Parse from "parse";
import _ from "lodash";
import Vue from "vue";
import { mapGetters } from "vuex";
const DomParser = new DOMParser();
const $ = go.GraphObject.make;
const { NUXT_ENV_OSS_URL } = process.env;

const shapes = go.Shape.getFigureGenerators().toArray();

let palettes = {};
let $side = null;
let $picture = null;

export default {
  components: {
    OrganizationList
  },
  props: {
    categories: {
      type: Array,
      default() {
        return [];
      }
    },
    category: {
      required: true,
      type: String
    }
  }
};
</script>

<style lang="scss" >
@import "~/assets/variables.scss";
section.shape-bar {
  // .content {
  //   background: #fff;
  //   border-radius: 16px;
  // }
  // .v-expansion-panel-header {
  //   border-radius: 0 !important;
  // }

  .v-expansion-panel-content__wrap {
    padding: 0 !important;
  }

  // .v-expansion-panels {
  //   border-radius: 14px !important;
  // }

  // .v-expansion-panel--active {
  //   border-radius: 14px !important;
  // }
}
</style>




