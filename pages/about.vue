<template>
  <div class="about d-flex flex-column align-center justify-space-between grey lighten-4 flex-grow-1">
    <hair :dark="false" />
    <v-card width="100%" max-width="800px" flat tile class="pa-10">
      <v-card-text class="text-center">
        <h2 style="line-height: 42px;font-size: 28px;">关于我们</h2>
        <v-divider>简单|易用|免费</v-divider>
      </v-card-text>
      <v-card-text
        style="line-height: 28px;"
      >泾河新城星系网络工作室成立于2019年, 工作室经成立后便飞快发展,秉承着"易用,快速,友好"的设计理念,开发出"蓝图巴巴"这一款生产力工具,该工具支持在线绘制流程图、思维导图、原型图、网络拓扑图和UML等多种图形.</v-card-text>
      <v-card-text style="line-height: 28px;">
        <div>QQ 群:344367382</div>
        <div>邮箱:support@lantubaba.com</div>
        <div>公司地址:陕西省泾河新城团一路17号</div>
      </v-card-text>
    </v-card>
    <foot :dark="false" />
  </div>
</template>
<script>
import Hair from "../components/Hair";
import Foot from "../components/Foot";
export default {
  components: {
    Hair,
    Foot
  },
  data() {
    return {};
  }
};
</script>
<style lang="scss">
.about {
  * {
    letter-spacing: 2px;
    font-weight: 200;
  }
}
</style>