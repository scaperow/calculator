<template>
<section class="d-flex flex-column flex-grow-1">
  <hair></hair>
  <div class="d-flex flex-column align-center justify-center flex-grow-1">
    <h1>蓝图巴巴</h1>
    <p>流程图、思维导图、UML 图 等等，统统搞定</p>
    <v-btn rounded color="white" depressed x-large @click="start">开始创作</v-btn>
  </div>
  <foot></foot>
</section>
</template>

<script>
import Parse from "parse";
import UserAvatar from "../components/UserAvatar";
import Foot from "../components/Foot";
import Hair from "../components/Hair";
import { mapGetters } from "vuex";

export default {
  name: "app",
  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },
  components: {
    UserAvatar,
    Foot,
    Hair
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

<style lang="scss" scoped>
@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

section {
  letter-spacing: 2px;
  font-weight: 200;
  margin: 0;
  font-family: "Exo", sans-serif;

  font-weight: 200;
  margin: 0;
  color: #fff;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;

  .header {
    padding: 0 24px;
    .right {
      text-align: right;
    }
  }

  .container {
    width: 100%;
    position: absolute;
    top: 35%;
    text-align: center;
    letter-spacing: 2px;

    button {
      background: #3333;
      color: #fff;
      letter-spacing: 2px;
      border-radius: 65px;
      transition: all 0.3s;
      font-size: 18px;
      width: auto;
      height: 65px;
      padding: 0 32px;
      cursor: pointer;
      margin: 0;
      line-height: 65px;
      border: none;

      &:hover {
        background: #fff;
        color: #333;
      }

      &.tip {
        margin-top: 36px;
      }
    }
  }

  .footer {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: -100px;
    height: 100px;
    background: #fff;
    color: #9c9c9c;

    h3 {
      font-weight: 200;
    }

    h5 {
      font-weight: 200;
    }
  }

  h1 {
    font-weight: 300;
    font-size: 32px;
    font-size: 46px;
  }

  p {
    font-size: 28px;
  }

  a,
  a:hover {
    text-decoration: none;
    color: #ddd;
  }
}
</style>
