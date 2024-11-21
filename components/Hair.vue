<template>
  <v-toolbar max-height="80" height="80" tile flat width="100%" :color="color" :dark="dark">
    <v-toolbar-title @click="$router.go('/')">
      <div class="logo">蓝图巴巴</div>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn v-if="user" text large nuxt to="/desktop">我的文件</v-btn>
    <v-btn v-if="!user" text large nuxt to="/login">登录</v-btn>
    <v-btn v-if="!user" text large nuxt to="/login">注册</v-btn>
    <v-btn text nuxt large to="/price">价格</v-btn>

    <user-avatar class="ml-6" v-if="user"></user-avatar>
  </v-toolbar>
</template>
<script>
import Parse from "parse";
import UserAvatar from "../components/UserAvatar";
import { mapGetters } from "vuex";

export default {
  name: "app",
  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },
  props: {
    color: {
      default: "transparent"
    },
    dark: {
      default: true
    }
  },
  components: {
    UserAvatar
  },
  methods: {
    clickMenu(command) {
      this.$options.methods[command].apply(this);
    },

    start() {
      if (this.user) {
        this.$router.push({ path: "/desktop" });
      } else {
        this.$router.push({ path: "/login" });
      }
    },
    sigup() {},
    sigin() {},
    async sigout() {
      await this.$store.dispatch("user/logout");
      this.$router.push({ name: "login" });
    }
  },
  async mounted() {
    this.$store.dispatch("user/getUser");
  }
};
</script>