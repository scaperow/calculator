<template>
  <v-card flat class="works">
    <v-hover v-if="model.isDelete===true">
      <template v-slot:default="{ hover }">
        <v-card-text>
          <v-img v-if="model.isDelete === true" class="folder" src="/folder.svg" />
          <v-fade-transition v-if="model.isDelete === true">
            <v-overlay v-if="hover" absolute color="transparent">
              <v-btn block class="mb-2" @click.stop="$emit('remove_forever')">彻底删除</v-btn>
              <v-btn class="mb-2" @click.stop="$emit('recovery')" block>还原</v-btn>
            </v-overlay>
          </v-fade-transition>
        </v-card-text>
      </template>
    </v-hover>

    <v-card-text v-else>
      <!-- <v-img  src="/folder.svg" /> -->
      <svg
        v-ripple
        @click.stop="$emit('open')"
        class="folder"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
        width="190px"
        height="190px"
        viewBox="0 0 190 190"
        version="1.1"
      >
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
          <path
            d="M1.74272727,190 C0.78,190 0,189.197295 0,188.207672 L0,1.79232751 C0,0.802704646 0.78,0 1.74272727,0 L47.9354545,0 C50.3327273,0 51.8581818,2.12915984 51.8581818,2.12915984 L60.1372727,9.07454756 L188.256364,8.96258639 C189.219091,8.96258639 190,9.76529104 190,10.7549139 L190,188.207672 C190,189.197295 189.219091,190 188.256364,190 L1.74272727,190 Z"
            fill="#D5D8DB"
            stroke="#bbbbbb"
            stroke-width="1"
            sketch:type="MSShapeGroup"
          />
        </g>
      </svg>
    </v-card-text>

    <v-card-actions class="d-flex justify-space-between">
      <label :title="model.name">{{model.name}}</label>

      <v-menu offset-y v-if="model.isDelete !== true">
        <template v-slot:activator="{ on }">
          <v-btn small text v-on="on">
            <v-icon>mdi-menu-down-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('rename')">
            <v-list-item-title>重命名</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('remove')">
            <v-list-item-title>删除</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('copy')">
            <v-list-item-title>复制</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('copy_to')">
            <v-list-item-title>复制到</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('move_to')">
            <v-list-item-title>移动到</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    model: {
      required: true
    }
  }
};
</script>
<style lang="scss" scoped>
.v-card {
  margin-right: 12px;
  svg {
    transition: all 0.3s;
    cursor: pointer;

    &.folder {
      &:hover {
        filter: drop-shadow(5px 5px 10px #ccc);
      }
    }
  }
}
</style>