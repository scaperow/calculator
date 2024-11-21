<template>
  <v-container>
    <v-tabs v-model="tab">
      <v-tab to="/manager/part">Part</v-tab>
      <v-tab to="/manager/organization">Organization</v-tab>
      <v-tab to="/manager/styles">Styles</v-tab>
      <v-tab to="/manager/icons">Icons</v-tab>
      <v-tab to="/manager/sample">SAMPLES</v-tab>
    </v-tabs>

    <router-view />
  </v-container>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      tab: null
    };
  }
};
</script>
<style lang="scss" scoped>
</style>


