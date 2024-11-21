<template>
  <svg width="200" height="200" :style="{background:background}">
    <polyline
      fill="transparent"
      points="78,100 180,100 180,160"
      stroke-width="1"
      v-bind="lineStyle"
    />
    <rect
      rx="5"
      ry="5"
      transform="rotate(45 -42 50)"
      x="0"
      y="0"
      width="80"
      height="80"
      v-bind="shapeStyle"
    />

    <circle cx="190" cy="5" r="50" v-bind="shapeStyle" />
    <rect rx="5" ry="5" x="120" y="160" width="120" height="80" v-bind="shapeStyle" />
    <rect x="110" rx="5" ry="5" y="90" v-bind="lineLabelStyle" width="50" height="20" />
    <text x="10" y="105" v-bind="shapeFontStyle" :style="shapeFontClass">条件</text>
    <text x="120" y="105" v-bind="lineFontStyle" :style="lineFontClass">成立</text>
  </svg>
</template>


<script>
export default {
  props: {
    styleObject: {
      required: true,
      default() {
        return {};
      }
    }
  },
  computed: {
    shapeFontStyle() {
      var shapeStyle = _.get(this.styleObject.model, "shape");

      return {
        fontSize: parseInt(shapeStyle.fontSize) + "px",
        fill: shapeStyle.fontColor,
        fontWeight: shapeStyle.fontBold ? "bolder" : null,
        fontStyle: shapeStyle.fontItalic ? "italic" : null
      };
    },
    shapeFontClass() {
      var shapeStyle = _.get(this.styleObject.model, "shape");

      return {
        fontWeight: shapeStyle.fontBold ? "bolder" : null,
        fontStyle: shapeStyle.fontItalic ? "italic" : null
      };
    },
    shapeStyle() {
      return _.pick(
        this.styleObject.model.shape,
        "fill",
        "stroke",
        "strokeWidth",
        "strokeDashArray"
      );
      //   return _.get(this.style, "model.shape");
    },
    lineLabelStyle() {
      return _.pick(
        this.styleObject.model.linelink.label,
        "fill",
        "stroke",
        "strokeWidth",
        "strokeDashArray"
      );
    },
    lineFontStyle() {
      var style = this.styleObject.model.linelink.label;

      return {
        fontSize: parseInt(style.fontSize) + "px",
        fill: style.fontColor
      };
    },
    lineFontClass() {
      var style = this.styleObject.model.linelink.label;

      return {
        fontWeight: style.fontBold ? "bolder" : null,
        fontStyle: style.fontItalic ? "italic" : null
      };
    },
    lineStyle() {
      return _.pick(
        this.styleObject.model.link,
        "stroke",
        "strokeWidth",
        "strokeDashArray"
      );
    },
    background() {
      return _.get(this.styleObject.model.root, "background");
    }
    // rootStyle(){
    //     return _.get()
    // }
  }
};
</script>
<style lang="scss" scoped>
</style>