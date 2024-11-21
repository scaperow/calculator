<template>
  <file-list root-name="我的分享"
             ref="fileList"
             :allow-create-folder="false"
             :filter="(args)=>$store.dispatch('works/getShareList', args)"></file-list>
</template>
<script>
import { mapGetters } from 'vuex'
import FileList from '~/components/FileList'

export default {
  middleware: 'authenticated',
  computed: {
    ...mapGetters({
      user: 'user/user'
    })
  },
  components: {
    FileList
  },
  activated () {
    this.$refs.fileList.getData()
  }
}
</script>
<style lang="scss" scoped>
</style>



