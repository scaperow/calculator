<template>
  <v-card flat max-width="220">
    <v-badge overlap color="orange">
      <template v-slot:badge v-if="model.isShare === true">
        <v-icon color="white">mdi-share-variant</v-icon>
      </template>
      <v-hover v-if="model.isDelete === true">
        <template v-slot:default="{ hover }">
          <v-img
            class="document"
            :src="model.capture"
            fit="contain"
            :alt="model.map"
          />

          <v-fade-transition>
            <v-overlay v-if="hover" absolute color="transparent">
              <v-btn block class="mb-2" @click.stop="$emit('remove_forever')">彻底删除</v-btn>
              <v-btn class="mb-2" @click.stop="$emit('recovery')" block>还原</v-btn>
            </v-overlay>

            <v-overlay v-else absolute color="transparent">
              <v-icon>mdi-trash-can-outline mdi-48px</v-icon>
              <div>已删除</div>
            </v-overlay>
          </v-fade-transition>
        </template>
      </v-hover>
      <v-img
        v-else
        class="document"
        v-ripple
        :src="model.capture"
        fit="contain"
        :alt="model.map"
        @click.prevent="$emit('open')"
      />
    </v-badge>

    <v-card-actions class="d-flex justify-space-between">
      <label :title="model.name">{{model.name}}</label>
      <v-menu offset-y v-if="model.isDelete !== true">
        <template v-slot:activator="{ on }">
          <v-btn small text v-on="on">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('rename')">
            <v-list-item-icon>
              <v-icon>mdi-file-document-edit-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>重命名</v-list-item-content>
          </v-list-item>
          <v-list-item @click="$emit('remove')">
            <v-list-item-icon>
              <v-icon>mdi-file-document-box-remove-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>删除</v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item @click="$emit('copy')">
            <v-list-item-icon>
              <v-icon>mdi-content-copy</v-icon>
            </v-list-item-icon>
            <v-list-item-content>复制</v-list-item-content>
          </v-list-item>
          <v-list-item @click="$emit('copy_to')">
            <v-list-item-icon>
              <v-icon>mdi-content-duplicate</v-icon>
            </v-list-item-icon>
            <v-list-item-content>复制到</v-list-item-content>
          </v-list-item>
          <v-list-item @click="$emit('move_to')">
            <v-list-item-icon>
              <v-icon>mdi-file-move-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>移动到</v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item @click="$emit('share')">
            <v-list-item-icon>
              <v-icon>mdi-share</v-icon>
            </v-list-item-icon>
            <v-list-item-content>分享</v-list-item-content>
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
  .v-image {
    transition: all 0.3s;
    cursor: pointer;
    &.document {
      background: #42a5f5;
      &:hover {
        transform: scale(1.2, 1.2);
      }
    }
  }
}
</style>