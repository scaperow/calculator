<template>
  <v-app>
    <nuxt />
    <v-overlay v-if="waiting" :value="true">
      <v-row
        align="center"
        justify="center"
        class="grey lighten-5"
        style="height: 300px;"
      >{{waiting.message}}</v-row>
    </v-overlay>

    <v-snackbar
      :ref="`message_${index}`"
      light
      v-model="messages[index].visible"
      class="application"
      :timeout="timeout || 3000"
      :color="color || 'info'"
      :bottom="y === 'bottom'"
      :left="x  === 'left'"
      :multi-line="mode || 'multi-line'"
      :right="x === 'right'"
      :top="y === 'top'"
      :vertical="vertical  === 'vertical'"
      v-for="({message,visible,timeout,color,mode,vertical,x='right',y='top',icon},index) in messages"
      :key="index"
    >
      <v-icon v-if="icon" dark left>{{ icon }}</v-icon>
      {{ message }}
    </v-snackbar>

    <v-dialog
      v-model="confirms[index].visible"
      v-for="({title, message,maxWidth,resolve,reject},index) in confirms"
      :key="index"
      :max-width="maxWidth || 580"
      @click:outside="cancel(confirms[index])"
      @keydown.esc="cancel(confirms[index])"
    >
      <v-card tile>
        <v-card-title v-html="title" />
        <v-card-text v-html="message" />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancel(confirms[index])">取消</v-btn>
          <v-btn text color="primary" @click="sure(confirms[index])">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="prompts[index].visible"
      v-for="({title,value,label,maxWidth, message,rules,resolve,reject},index) in prompts"
      :key="index"
      :max-width="maxWidth || 580"
      @click:outside="cancel(prompts[index])"
      @keydown.esc="cancel(prompts[index])"
      @keydown.enter="sure(prompts[index],value,`promptForm_${index}`) "
    >
      <v-card>
        <v-card-title v-html="title" />
        <v-card-text>
          <p v-html="message"></p>
          <v-form :ref="`promptForm_${index}`">
            <v-text-field v-model="prompts[index].value" filled :label="label" :rules="rules || []"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancel(prompts[index])">取消</v-btn>
          <v-btn text color="primary" @click="sure(prompts[index],value,`promptForm_${index}`) ">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
import { mapGetters } from "vuex";
let createWatcher = function() {
  return {
    handler(value) {
      var newly = value
        .filter(item => item.visible === false)
        .forEach((item, index) => value.splice(index));
    },
    deep: true
  };
};

export default {
  watch: {
    confirms: createWatcher(),
    prompts: createWatcher(),
    messages: createWatcher()
  },
  computed: {
    ...mapGetters({
      waiting: "overlay/waiting",
      confirms: "overlay/confirms",
      prompts: "overlay/prompts",
      messages: "overlay/messages"
    })
  },
  methods: {
    sure(options, value, validation) {
      if (validation && !this.$refs[validation][0].validate()) {
        return;
      }

      options.visible = false;
      options.resolve(value);
    },

    cancel(options) {
      options.visible = false;
      options.reject();
    }
  }
};
</script>