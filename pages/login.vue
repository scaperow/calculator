<template >
  <div class="primary d-flex flex-column justify-space-between align-stretch flex-grow-1">
    <div class="d-flex flex-row justify-start align-start pa-6">
      <div class="logo white--text">蓝图巴巴</div>
    </div>
    <div class="d-flex flex-grow-1 flex-column justify-center align-center">
      <v-card min-width="520" class="pa-12 pt-6" style="border-radius:16px">
        <v-card-title class="d-flex flex-row justify-center">
          <v-btn-toggle rounded v-model="step" color="primary" group>
            <v-btn text value="SIGIN">登录</v-btn>
            <v-btn text value="SIGUP">注册</v-btn>
          </v-btn-toggle>
        </v-card-title>
        <form class="mt-6" @submit.prevent="submit">
          <v-card-text v-show="step === 'SIGIN'">
            <v-alert dark color="error" v-show="siginMessage">{{siginMessage}}</v-alert>
            <div>
              <div>
                <v-text-field
                  filled
                  v-model="siginForm.username"
                  label="用户名"
                  hint="用户名/邮箱"
                  :rules="[$validate('isNotEmpty')]"
                ></v-text-field>
              </div>
              <div>
                <v-text-field
                  filled
                  type="password"
                  v-model="siginForm.password"
                  label="密码"
                  :rules="[$validate('isNotEmpty'),$validate('isPassword'),$validate('isLength',{min:6,max:24})]"
                ></v-text-field>
              </div>
            </div>
          </v-card-text>
          <v-card-text class="pt-20" v-show="step === 'SIGUP'">
            <v-alert dark color="error" v-show="sigupMessage">
              {{sigupMessage}}
              <span v-show="isRedirectSigin">
                或者使用该用户
                <v-btn outlined rounded @click="step = 'SIGIN'">登录</v-btn>
              </span>
            </v-alert>
            <div class="forms_fieldset">
              <div class="forms_field">
                <v-text-field
                  filled
                  label="用户名"
                  v-model="sigupForm.username"
                  :rules="[$validate('isNotEmpty'),$validate('isAlphanumeric'),$validate('isLength',{min:3,max:24})]"
                ></v-text-field>
              </div>
              <div class="forms_field">
                <v-text-field
                  filled
                  type="email"
                  label="邮箱"
                  :rules="[$validate('isNotEmpty'),$validate('isEmail')]"
                  v-model="sigupForm.email"
                  class="forms_field-input"
                ></v-text-field>
              </div>
              <div class="forms_field">
                <v-text-field
                  filled
                  type="password"
                  :rules="[$validate('isNotEmpty'),$validate('isPassword'),$validate('isLength',{min:6,max:24})]"
                  v-model="sigupForm.password"
                  label="密码"
                ></v-text-field>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="d-flex flex-row justify-space-between">
            <div>
              <v-btn text @click="$router.go('/')">
                <v-icon>mdi-arrow-left</v-icon>回到首页
              </v-btn>
            </div>
            <div v-show="step === 'SIGIN'">
              <v-btn text nuxt depressed target="_blank" to="/reset">忘记密码 ?</v-btn>
              <v-btn rounded type="submit" color="secondary" depressed :loading="sigining">登录</v-btn>
            </div>
            <div v-show="step === 'SIGUP'">
              <v-btn rounded type="submit" color="secondary" depressed :loading="siguping">注册</v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </div>
  </div>
</template>

<script>
import Parse from "parse";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoginForm",
  template: "#login-form",
  data() {
    return {
      sigining: false,
      siguping: false,
      text: "",
      isRedirectSigin: false,
      siginMessage: null,
      sigupMessage: null,
      isVisible: false,
      step: "SIGIN",
      siginForm: {
        username: "",
        password: ""
      },
      sigupForm: {
        username: "",
        email: "",
        password: "",
        retryPassword: ""
      }
    };
  },
  async created() {
    // if (this.user) {
    //   return this.$router.push({ path: '/welcome' })
    // }
    // const user = await Parse.User.currentAsync()
    // if (user) {
    //   this.$store.dispatch('user/setUser', user.toJSON())
    // }
  },
  computed: {
    ...mapGetters({ user: "user/user" })
  },
  methods: {
    async sigin() {
      let user = null;
      this.siginMessage = null;
      this.sigining = true;

      try {
        user = await Parse.User.logIn(
          this.siginForm.username,
          this.siginForm.password
        );
      } catch ({ code }) {
        this.siginMessage = "用户名或密码不正确";
      } finally {
        this.sigining = false;
      }

      if (user) {
        this.isVisible = false;
        this.siginForm = {
          username: "",
          password: ""
        };
        var role = await new Parse.Query(Parse.Role)
          .equalTo("users", Parse.User.current())
          .includeAll("*")
          .find();

        this.$store.dispatch("user/setUser", user.toJSON());
        this.$router.push({ path: "/desktop" });
      }
    },
    async logout() {
      try {
        await Parse.User.logOut();
        this.isVisible = true;
        this.$store.dispatch("user/setUser", null);
      } catch (error) {
        this.$catch(error);
      }
    },
    async validateEmail() {},
    async sigup() {
      try {
        await Parse.User.logOut();
      } catch (e) {}

      let isSuccess = false;
      let user = new Parse.User();
      user.set("username", this.sigupForm.username);
      user.set("password", this.sigupForm.password);
      user.set("email", this.sigupForm.email);

      this.siginMessage = null;
      this.siguping = true;
      this.isRedirectSigin = false;

      try {
        await user.signUp();
        isSuccess = true;
      } catch (error) {
        switch (error.code) {
          case 202:
            this.sigupMessage = "用户名已存在，请重试。";
            this.isRedirectSigin = true;
            break;

          case 203:
            this.sigupMessage = "邮箱已存在";
            this.isRedirectSigin = true;
            break;

          default:
            this.$catch(error);
        }
      } finally {
        this.siguping = false;
      }

      if (isSuccess) {
        this.$store.dispatch("user/setUser", user.toJSON());
        this.$message.success("注册成功");
        this.$router.push("/desktop");
        this.step = "SIGIN";
        this.sigupForm = {
          username: "",
          email: "",
          password: "",
          retryPassword: ""
        };
      }
    },
    submit() {
      if (this.step === "SIGUP") {
        this.sigup();
      } else {
        this.sigin();
      }
    }
  }
};
</script>

