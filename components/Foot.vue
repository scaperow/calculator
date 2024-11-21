<template>
  <v-footer padless color="transparent" :dark="dark">
    <v-container>
      <v-card flat tile width="100%" color="transparent">
        <!-- <v-card-text>
        <v-btn v-for="icon in icons" :key="icon" class="mx-4 white--text" icon>
          <v-icon size="24px">{{ icon }}</v-icon>
        </v-btn>
        </v-card-text>-->

        <v-card-text class="d-flex flex-column justify-center align-center">
          <div>
            <v-btn nuxt text to="/">首页</v-btn>
            <v-btn nuxt text to="/about">关于我们</v-btn>
            <v-btn nuxt text to="/clause">服务条款</v-btn>
            <v-btn nuxt text to="/helper">帮助中心</v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex flex-column justify-center">
          <!-- <div>星系网络工作室</div> -->
          <small>© 2019 lantubaba.com 版权所有 ICP证：陕15009690号-2</small>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-footer>
  <!--   
  <v-footer padless>
    <v-col class="text-center" cols="12">
      {{ new Date().getFullYear() }} —
      <strong>星系工作室</strong>
    </v-col>
    <v-col class="text-center" cols="12">
      <small>
        陕ICP备
        <a href="http://www.miitbeian.gov.cn" target="_blank" rel="nofollow">15009690号-2</a>
      </small>
    </v-col>
  </v-footer>-->
</template>
<script>
export default {
  props: {
    dark: {
      default: true
    }
  }
};
</script>