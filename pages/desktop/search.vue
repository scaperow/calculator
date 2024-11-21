<template>

  <file-list :root-name="`搜索 '${keyword}'`"
             ref="fileList"
             :filter="filter">
    <div slot="empty-message">
      没有搜索到任何内容 ~
    </div>
  </file-list>
</template>
<script>

import Parse from 'parse'
import { mapGetters } from 'vuex'
import FileList from '~/components/FileList'

export default {

  middleware: 'authenticated',
  computed: {
    ...mapGetters({
      user: 'user/user'
    }),
    keyword () {
      return this.$route.query.keyword
    }
  },
  watch: {
    keyword () {
      if (this.keyword && this.$refs.fileList) {
        this.$refs.fileList.backFolder(-1)
        this.$refs.fileList.getData()
      }
    }
  },
  components: {
    FileList
  },
  activated () {
  },
  methods: {
    filter ({ folder } = {}) {
      return this.$store.dispatch('works/search', {
        folder: folder,
        keyword: folder ? null : this.keyword
      })
    },
  }
}
</script>
<style lang="scss" scoped>
</style>



