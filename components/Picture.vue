<template>
  <v-dialog v-model="visible"
            :width="900"
            scrollable
            color="white"
            dark>
    <v-card :loading="loading">
      <v-card-title>
        选择图片
      </v-card-title>

      <v-card-text style="overflow: hidden;">
        <v-stepper v-model="step">
          <!-- <v-stepper-header :elevation="0">
        <v-stepper-step :complete="step > 1"
                        step="1">上传图片</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step >= 2"
                        step="2">裁剪大小</v-stepper-step>

      </v-stepper-header> -->

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-subheader class="mb-6">
                <v-icon class="mr-2 ">mdi-information</v-icon>您可以选择导入网络图片或从电脑上传图片
              </v-subheader>
              <v-container fluid>
                <v-row>
                  <v-col cols="8"
                         class="pa-0 d-flex justify-center align-center">
                    <!-- <v-btn text
                         @click="isShowInput = true">导入网络图片</v-btn> -->

                    <v-form ref="urlForm"
                            style="width:100%;">
                      <v-text-field :rules="[$validate('isURL|isEmpty')]"
                                    type="url"
                                    placeholder="输入网络图片地址"
                                    v-model="urlValue"
                                    :append-outer-icon="urlValue?'mdi-arrow-right-bold-circle':null"
                                    @click:append-outer.stop="saveFileUrl"></v-text-field>
                    </v-form>
                  </v-col>
                  <v-col cols="2"
                         class="pa-0 d-flex justify-center align-center">
                    <v-divider vertical></v-divider>
                  </v-col>
                  <v-col cols="2"
                         class="pa-0 d-flex justify-center align-center">
                    <clipper-upload accept="*,png,jpg,jpeg,gif"
                                    v-model="imageUrl">

                      <v-btn color="primary">上传本地文件</v-btn>
                    </clipper-upload>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>

            <v-stepper-content step="2"
                               class="pa-0">
              <div class="d-flex flex-column justify-center align-stretch"
                   style="min-height:480px">
                <clipper-fixed ref="clipper"
                               :src="imageUrl"
                               :rotate="clipRotate"
                               :scale="clipScale"
                               style="height:400px">
                  <div slot="placeholder">图片不正确</div>
                </clipper-fixed>

                <div class="pa-4">
                  <label>旋转</label>
                  <v-slider :max="360"
                            :min="1"
                            v-model="clipRotate"
                            :format-tooltip="(val)=> val+'°'"></v-slider>
                </div>
              </div>

            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card-text>

      <v-card-actions class="v-flex flex-row-reverse">

        <v-btn text
               large
               color="secondary"
               @click="visible = false">
          取消
        </v-btn>
        <v-btn text
               large
               color="primary"
               @click="save"
               v-show="step > 1">保存</v-btn>
        <v-btn text
               large
               @click="imageUrl = null"
               v-show="step > 1">
          <v-icon>mdi-arrow-left</v-icon>
          重新选择图片
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import OSS from 'ali-oss'
import { clipperFixed, clipperUpload } from 'vuejs-clipper'
import _ from 'lodash'
import Parse from 'parse'

const maxSizeLimit = process.env.NUXT_ENV_UPLOAD_IMAGE_MAX_SIZE || 1
const ossUrl = process.env.NUXT_ENV_OSS_URL
const ossRegion = process.env.NUXT_ENV_OSS_REGION
const ossBucket = process.env.NUXT_ENV_OSS_BUCKET

export default {
  props: {
    showName: false,
    width: 400,
    height: 400,
    source: ['file', 'url'],
    maxSize: maxSizeLimit,
    onSave: null,
    loading: false,
  },
  computed: {
  },
  components: {
    clipperFixed, clipperUpload
  },
  watch: {
    imageUrl (value) {
      this.step = _.isEmpty(value) ? 1 : 2
    },
    async visible (val) {
      this.step = 1
      this.isShowInput = false
      this.imageUrl = null
      this.urlValue = null
      this.isSaving = false
    }
  },
  data () {
    return {
      previewName: null,
      clipRotate: 0,
      clipScale: 1,
      previewImage: null,
      step: 1,
      urlValue: null,
      isShowInput: false,
      imageUrl: null,
      visible: false
    }
  },
  methods: {
    async save () {
      let canvas = this.$refs.clipper.clip()
      let blob = canvas.toBlob(async (blob) => {
        if (blob.size > maxSizeLimit * 1024 * 1024) {
          return this.$message.error(`图片不能大于 ${maxSizeLimit} M,请裁剪到小一点`)
        }

        if (blob) {
          if (this.onSave instanceof Function) {
            this.onSave({
              blob, canvas
            })
          }
        } else {
          this.isSaving = false
        }
      }, 'image/jpeg')
    },
    open () {
      this.visible = true
    },
    close () {
      this.visible = false
    },
    saveFileUrl () {
      if (this.$refs.urlForm.validate()) {
        this.imageUrl = this.urlValue
        this.step = '2'
      }
    }
  },
}
</script>

<style lang="scss" scoped>
#sideCanvas {
  height: 100vh;
}

.container {
  border-radius: 6px;
}

.v-btn.more {
  font-size: 24px;
}

.tool {
  height: 40px;
  line-height: 40px;
  padding: 6px 12px;
  background: #f5f7fa;

  i.fa {
    cursor: pointer;
    color: #666;
    border-radius: 112px;
    border: solid 1px #ccc;
    width: 26px;
    height: 26px;
    text-align: center;
    line-height: 26px;
    margin-right: 6px;
    background: #fff;

    &:hover {
      border-color: #409eff;
      box-shadow: 3px 3px 6px -3px #409eff;
      color: #fff;
      background: #409eff;
    }
  }
}
</style>
<style lang="scss">
.el-collapse {
  .el-collapse-item {
    div[role="button"] {
      padding-left: 12px;
      padding-right: 12px;

      &:hover {
        color: #409eff;
      }
    }

    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
}

.el-tabs {
  background: #fff;
}

.clipper-container {
  vertical-align: top;
  display: inline-block;
  width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.preview-container {
  display: inline-block;
  width: 300px;
  vertical-align: top;
  margin-left: 24px;

  .wrapper {
    box-shadow: 6px 6px 6px -3px #666;
  }
}
</style>
<style lang="scss" scoped>
</style>


