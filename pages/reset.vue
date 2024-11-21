<template >
  <div class="primary d-flex flex-column justify-space-between align-stretch flex-grow-1">
    <div class="d-flex flex-row justify-start align-start pa-6">
      <div class="logo white--text">蓝图巴巴</div>
    </div>
    <div class="d-flex flex-grow-1 flex-column justify-center align-center">
      <v-card class="pa-6" min-width="580" style="border-radius:16px">
        <v-card-title>蓝图巴巴 - 重置密码</v-card-title>
        <v-form @submit.prevent="submit" ref="form" class="mt-4">
          <v-card-text>
            <v-alert color="success" class="white--text mb-4" v-show="success">请到邮箱中查收修改密码的链接</v-alert>

            <v-alert
              color="error"
              class="white--text mb-4"
              v-show="error && errorMessage"
              v-html="errorMessage"
            ></v-alert>

            <v-text-field
              filled
              rounded
              v-model="email"
              :rules="[$validate('isEmail')]"
              label="请输入您的邮箱"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="d-flex flex-row-reverse">
            <v-btn type="submit" depressed rounded color="secondary">确认重置</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script>
import Parse from "parse";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      email: null,
      success: false,
      error: false,
      errorMessage: null
    };
  },
  watch: {
    success(value) {
      if (value === true) {
        this.error = false;
      }
    },
    error(value) {
      if (value === true) {
        this.success = false;
      }
    }
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          await Parse.User.requestPasswordReset(this.email);
          this.success = true;
        } catch (error) {
          this.$catche(error);
          // this.error = true
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>

