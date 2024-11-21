<template>
  <section style="overflow-y:auto">
    <v-text-field
      label="搜索"
      color="black"
      v-model="keyword"
      class="ml-2 mr-2"
      :loading="isSearching"
      prepend-inner-icon="mdi-cloud-search"
      clearable
    ></v-text-field>
    <!-- <v-btn text icon>
      <v-icon>mdi-search</v-icon>
    </v-btn>-->
    <v-expansion-panels accordion multiple :value="expandes" class="elevation-0">
      <v-expansion-panel
        class="elevation-0 pa-0"
        v-for="(organization) in organizations"
        :key="organization.objectId"
      >
        <v-expansion-panel-header>{{ organization.name}}</v-expansion-panel-header>
        <v-expansion-panel-content class="pa-0">
          <div style="width:100%;height:300px" :id="`plette_${organization.objectId}`"></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div v-show="hasMore && !isSearching" class="mt-4 text-center">
      <v-btn @click="fetchMore" text>加载更多</v-btn>
    </div>
    <v-card color="transparent" flat v-show="organizations.length === 0 && !isSearching">
      <v-card-text class="text-center">
        <slot>
          <!-- <v-icon class="ma-4 mdi-36px">mdi-emoticon-neutral-outline</v-icon> -->
          {{keyword ?'查无记录':'这里空空如也 ~'}}
        </slot>
      </v-card-text>
    </v-card>
  </section>
</template>

<script>
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

export default {
  props: {
    category: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      palettes: {},
      isSearching: true,
      keyword: null,
      organizations: [],
      index: 0,
      size: 10,
      hasMore: false
    };
  },
  async created() {},
  computed: {
    ...mapGetters({
      map: "go/map"
    }),
    expandes() {
      return _.chain(this.organizations)
        .map((organization, index) => (organization.isExpand ? index : null))
        .filter(item => item !== null)
        .value();
    },
    style() {
      return {
        model: _.map(TemplateMaker.categoryStyle, (style, organization) => {
          if (style) {
            style.width = style.height = 30;
            return { [organization]: style };
          } else {
            return null;
          }
        })
      };
    }
  },
  watch: {
    category() {
      this.fetchShapes();
    },
    map() {
      this.fetchShapes();
    },
    keyword(value, previous) {
      this.isSearching = true;
      this.search();
    },
    expandes() {
      this.$nextTick(() => {
        _.chain(this.expandes)
          .map(expander => this.organizations[expander])
          .compact()
          .filter(org => _.isEmpty(_.get(this.palettes, org.objectId)))
          .each(org => {
            console.log(org);
            this.createPalatte(org);
          })
          .value();
      });
    }
  },
  methods: {
    createPalatte(organization) {
      var palette = null;

      if (organization) {
        palette = $(go.Palette, `plette_${organization.objectId}`, {
          layout: $(go.GridLayout, {
            cellSize: new go.Size(20, 20),
            //spacing: new go.Size(12, 12),
            sorting: go.GridLayout.LeftToRight
          }),
          padding: new go.Margin(10, 12, 10, 12)
        });
        palette.ir = function() {};
        palette.setProperties({
          ...this.map.templateMaker.makeGroupTemplate(true),
          ...this.map.templateMaker.makeNodeTemplates(true)
        });

        palette.layoutDiagram();

        this.palettes[organization.objectId] = palette;
        _.each(organization.shapes, shape => {
          if (shape.allowCreate !== false) {
            this.showNode(palette, shape);
          }
        });
      }
    },
    search: _.debounce(
      async function(keyword) {
        this.index = 0;
        this.organizations = [];
        this.palettes = {};
        this.fetchShapes();
      },
      1500,
      { leading: false }
    ),
    async showNode(palette, shape) {
      let {
        organization,
        model,
        objectId: id,
        name,
        xml,
        ports = [],
        category
      } = shape;

      let portArray = ports.map((port, index) => {
        return {
          id: "_p#" + index,
          spot: port
        };
      });

      model = {
        ...model,
        ports: portArray,
        organization,
        name,
        zOrder: 0,
        category
      };

      if (!_.isEmpty(xml)) {
        let dom = DomParser.parseFromString(xml, "text/xml");
        var svg = dom.getElementsByTagName("svg")[0];
        var paths = svg.getElementsByTagName("path");
        var itemArray = _.map(svg.getElementsByTagName("path"), path => {
          return {
            geometryString: go.Geometry.fillPath(path.getAttribute("d")),
            fill: path.getAttribute("fill")
          };
        });

        _.set(model, "itemArray", itemArray);
      }

      palette.model.addNodeData(model);
    },
    async fetchMore() {
      this.index++;
      await this.fetchShapes();
    },
    async fetchShapes(organization) {
      if (this.map && this.category) {
        this.isSearching = true;
        var { count, results } = await this.$store.dispatch("shape/search", {
          map: this.map.name,
          keyword: this.keyword,
          category: this.category,
          size: this.size,
          index: this.index
        });

        this.organizations = [...this.organizations, ...results];
        this.hasMore = (this.index + 1) * this.size < count;
        this.isSearching = false;
      }
    }
  },
  mounted() {},
  beforeDestroy() {
    _.each(this.palettes, palette => {
      palette.div = null;
    });
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




