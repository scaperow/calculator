<template>
  <file-list root-name="我的作品"
             :allow-create-folder="false"
             :filter="(args)=>$store.dispatch('works/getMineList', args)">
  </file-list>
</template>
<script>

import Parse from 'parse'
import Http from '~/api/common'
import { mapGetters } from 'vuex'
import NanoId from 'nanoid'
import ShareModal from '~/components/Share'
import FileList from '~/components/FileList'
const WorksClass = Parse.Object.extend('works')

export default {

  middleware: 'authenticated',
  computed: {
    ...mapGetters({
      user: 'user/user'
    })
  },
  components: {
    ShareModal, FileList
  },
  data () {
    return {
      filter: null
    }
  },
  created () {
  }
}
</script>
<style lang="scss" scoped>
</style>



