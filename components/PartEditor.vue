<template>
  <v-card v-if="formSchema && formValue">
    <v-card-text>
      <vuetify-form :value="formValue" :schema="formSchema" @update="onUpdate" />
    </v-card-text>
  </v-card>
</template>
<script>
import { mapGetters } from "vuex";
import VuetifyForm from "vuetify-form-base";
export default {
  data() {
    return {
      formValue: null,
      formSchema: null,
      selectionPart: null
    };
  },
  components: {
    VuetifyForm
  },
  computed: {
    ...mapGetters({
      map: "go/map"
    })
  },
  watch: {
    selectionPart() {
      this.formSchema = null;
      this.formValue = null;

      if (!this.selectionPart) {
        return;
      }

      var templater = this.map.templateMaker.getTemplate(this.selectionPart);
      if (!templater) {
        return;
      }

      if (!templater.form) {
        return;
      }

      this.formSchema = templater.form;
      this.formValue = _.reduce(
        templater.form,
        (result, value, key) => {
          result[key] = this.selectionPart.data[key] || null;
          return result;
        },
        {}
      );
    },
    map() {
      if (this.map) {
        this.map.addMapListener("ChangedSelection", event => {
          this.selectionPart = this.map.canvas.selection.first();
        });
      }
    }
  },
  methods: {
    onUpdate({ key, value }) {
      if (this.selectionPart) {
        this.map.canvas.model.commit($ => {
          $.setDataProperty(this.selectionPart.data, key, value);
        });
      }
    }
  }
};
</script>