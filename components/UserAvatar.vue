<template>
  <section
    style="cursor:pointer;background:transparent"
    :style="`width:${width}px;height:${height}px`"
  >
    <v-menu v-if="user" :close-on-content-click="false" :nudge-width="200" offset-y>
      <template v-slot:activator="{ on }">
        <v-avatar :width="width" :height="height" v-ripple v-on="on" color="blue-grey">
          <v-img v-if=" user.avatar" class="avatar" :src="user.avatar" />
          <v-icon v-else color="white">mdi-account</v-icon>
        </v-avatar>
      </template>
      <v-card>
        <v-card-title>欢迎您, {{user.nick || user.username}}</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item @click="$router.push('/desktop')">我的文件</v-list-item>
            <v-divider />
            <v-list-item nuxt to="/personal?action=basic">个人信息</v-list-item>
            <v-list-item nuxt to="/personal?action=password">修改密码</v-list-item>
            <v-divider />
            <v-list-item @click="sigout">退出登录</v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>
    <v-avatar
      :width="width"
      :height="height"
      v-else
      v-ripple
      color="blue-grey"
      @click="$router.push('/login')"
    >
      <v-icon color="white">mdi-account</v-icon>
    </v-avatar>
  </section>
</template>
<script>
import { mapGetters } from "vuex";
import Parse from "parse";
import { debuglog } from "util";
export default {
  data() {
    return {
      mineRules: {
        username: {
          type: String,
          min: 3,
          max: 24,
          pattern: "[a-Z0-9]"
        }
      },
      showUserSetting: false,
      mineSource: null,
      mineModel: null,
      isMineModal: false
    };
  },
  props: {
    width: {
      type: Number,
      default: 48
    },
    height: {
      type: Number,
      default: 48
    }
  },
  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },
  methods: {
    async newAvatar() {
      const avatar = await Parse.Cloud.run("makeAvatar");
      this.$store.dispatch("user/updateAvatar", avatar);
    },
    async sigout() {
      await this.$store.dispatch("user/logout");
      this.$router.push("/login");
    },
    verifyEmail() {},
    systemSetting() {},
    saveMine() {},
    async changePassword() {
      var email = this.mineModel.email;
      try {
        await Parse.User.requestPasswordReset(email);

        this.$message({
          message: `修改链接已发送到您的邮箱(${email})，请从邮件中修改`,
          type: "success"
        });
      } catch (error) {
        this.$catch(error);
      }
    },
    onCommand(command) {
      switch (command) {
        case "USER_SETTING":
          this.showUserSetting = true;
          break;

        case "SYSTEM_SETTING":
          break;
      }
    }
  }
};
</script>

