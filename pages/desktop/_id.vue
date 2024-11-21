<template>
  <file-list
    root-name="我的作品"
    ref="fileList"
  ></file-list>
</template>
<script>
import Parse from "parse";
import { mapGetters } from "vuex";
import FileList from "~/components/FileList";
const WorksClass = Parse.Object.extend("works");

export default {
  middleware: "authenticated",
  computed: {
    folderId() {
      return this.$route.params.id;
    }
  },
  components: {
    FileList
  },
  watch: {
    folderId() {
      //this.$refs.fileList.getData();
      this.$store.dispatch("works/getMineList", {
        folderId: this.folderId
      });
    }
  },
  data() {
    return {
      filter: null
    };
  },
  created() {}
};
</script>
<style lang="scss" scoped>
</style>



