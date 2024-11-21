<template>
  <v-dialog class="share"
            width="760px"
            v-model="isOpening">
    <v-card>
      <v-card-title>分享</v-card-title>
      <v-card-text>
        <v-tabs v-model="tab"
                grow>
          <v-tab>
            <v-icon :color="shareModel.shareWithLink?'success':'warning'"
                    class="mr-2"
                    v-html="shareModel.shareWithLink ?'mdi-check-circle-outline':'mdi-close-circle-outline'"></v-icon> 链接分享
          </v-tab>
          <v-tab>
            <v-icon :color="shareModel.shareWithPicture?'success':'warning'"
                    class="mr-2"
                    v-html="shareModel.shareWithPicture ?'mdi-check-circle-outline':'mdi-close-circle-outline'"></v-icon> 图片分享
          </v-tab>
          <v-tab>
            <v-icon :color="shareModel.shareWithMedia?'success':'warning'"
                    class="mr-2"
                    v-html="shareModel.shareWithMedia ?'mdi-check-circle-outline':'mdi-close-circle-outline'"></v-icon> IFRAME 分享
          </v-tab>

          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-alert icon="mdi-shield-lock-outline"
                       prominent
                       text
                       type="info">
                复制并下方链接并发送给对方, 获取此链接的人都可以查看该文件
              </v-alert>
              <div>
                <v-switch inset
                          color="secondary"
                          v-model="shareModel.shareWithLink"
                          label="启用"
                          @change="onSwitchLinkShare">
                </v-switch>
                <v-form ref="form"
                        :disabled="!shareModel.shareWithLink"
                        :model="shareModel">

                  <v-text-field :disabled="!shareModel.shareWithLink"
                                label="链接地址"
                                readonly
                                filled
                                v-model="shareLink"
                                append-outer-icon="mdi-content-copy"
                                @click:append-outer="copyToClipboard(shareLink)">
                    <template v-slot:append-outer>

                      <v-menu :close-on-content-click="false"
                              :nudge-width="200"
                              offset-x>
                        <template v-slot:activator="{ on }">
                          <v-btn title="生成新链接"
                                 text
                                 icon
                                 v-on="on">
                            <v-icon>mdi-refresh</v-icon>
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-text>
                            <p>点击继续将生成新的链接, 旧链接同时会失效</p>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn color="primary"
                                   text
                                   @click.stop="createShareLink">继续</v-btn>
                            <v-btn text
                                   @click.stop="isCreateShareLink = false">取消</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-menu>

                      <v-btn title="复制链接"
                             text
                             icon
                             @click.stop="copyToClipboard(shareLink)">
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-text-field :disabled="!shareModel.shareWithLink"
                                filled
                                :rules="[$validate('isPassword'),$validate('isLength|isEmpty',{min:4,max:12})]"
                                label="访问密码"
                                v-model="sharePassword"
                                placeholder="如果不设置访问权限, 请留空密码">

                    <template v-slot:append-outer>
                      <v-btn @click.stop="randomPassword"
                             title="生成一个随机密码"
                             text
                             icon>
                        <v-icon>mdi-refresh</v-icon>
                      </v-btn>
                      <v-btn @click.stop="savePassword"
                             v-if="$refs.form"
                             icon
                             text
                             color="primary"
                             title="保存密码"
                             :disabled="!dirtyPassword">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-form>
              </div>
            </v-tab-item>
            <v-tab-item>
              <v-alert icon="mdi-shield-lock-outline"
                       prominent
                       text
                       type="info">
                复制并下方链接并发送给对方, 获取此链接的人都可以查看该文件
              </v-alert>
              <div>
                <v-switch inset
                          v-model="shareModel.shareWithPicture"
                          label="启用"
                          color="secondary"
                          @change="onSwitchPictureShare">
                </v-switch>
                <v-text-field :disabled="!shareModel.shareWithPicture"
                              label="链接地址"
                              :value="pictureUrl"
                              readonly>
                  <template v-slot:append-outer>
                    <v-btn text
                           icon
                           title="复制地址"
                           @click="copyToClipboard(pictureUrl)">
                      <v-icon class="iconfont icon-copy">mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </div>
            </v-tab-item>
            <v-tab-item>
              <v-alert icon="mdi-shield-lock-outline"
                       prominent
                       text
                       type="info">
                您可以通过 iframe 的方式嵌入到第三方网站
              </v-alert>
              <div>
                <v-switch inset
                          v-model="shareModel.shareWithMedia"
                          label="启用"
                          color="secondary"
                          @change="onSwitchMediaShare">
                </v-switch>
                <v-row>
                  <v-col>
                    <v-text-field label="宽度"
                                  v-model="width"
                                  :persistent-hint="true"
                                  hint='单位 (px)'
                                  type="number"></v-text-field>
                  </v-col>
                  <v-col>
                    <label></label>
                    <v-text-field label="高度"
                                  v-model="height"
                                  :persistent-hint="true"
                                  hint='单位 (px)'
                                  type="number"></v-text-field>
                  </v-col>
                </v-row>

                <v-textarea type="textarea"
                            filled
                            :rows="5"
                            readonly
                            :value="shareMedia">
                  <template v-slot:append-outer>
                    <v-btn text
                           icon
                           title="复制地址"
                           @click="copyToClipboard(shareMedia)">
                      <v-icon class="iconfont icon-copy">mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>
<script>

import Parse from 'parse'
import Http from '~/api/common'
import { mapGetters } from 'vuex'
import NanoId from 'nanoid'

const ShareClass = Parse.Object.extend('share')
const WorksClass = Parse.Object.extend('works')
const ShareApi = Http.create('share')
const { NUXT_ENV_SITE_DOMAIN } = process.env
const copyToClipboard = function (text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text);

  } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export default {
  computed: {
    dirtyPassword () {
      return this.validatePasswordForm && !_.isEqual(this.shareModel.password || null, this.sharePassword || null)
    },
    validatePasswordForm () {
      return this.$refs.form.validate()
    },
    shareLink () {
      if (this.shareModel.link) {
        return `${NUXT_ENV_SITE_DOMAIN}/share/?id=${this.shareModel.link}`
      }

      return null
    },
    pictureUrl () {
      if (this.shareModel.picture) {
        return `${NUXT_ENV_SITE_DOMAIN}/share/${this.sourceId}.png`
      }

      return null
    },
    shareMedia () {
      let url = `${NUXT_ENV_SITE_DOMAIN}/share/media/${this.sourceId}`
      let code = `<iframe  frameborder="0" style="display:block;width:${this.width}px; height:${this.height}px;" src="${url}"></iframe>`

      return code
    }
  },
  data () {
    return {
      tab: null,
      shareObject: null,
      sourceId: null,
      passwordValidation: null,
      isOpening: false,
      isLoading: false,
      shareMessage: '',
      isSavingPassword: false,
      sharePassword: null,
      pageIndex: 0,
      pageSize: 10,
      worksList: [],
      worksTotal: 0,
      folderPath: [],
      isCreating: false,
      isCreateShareLink: false,
      shareModel: {},
      width: 500,
      height: 500
    }
  },
  watch: {
  },
  methods: {
    open (id) {
      var shareQuery = new Parse.Query(ShareClass)
      this.sourceId = id
      this.isOpening = true

      this.$nextTick(async () => {
        this.isLoading = true

        try {
          this.shareObject = await shareQuery.equalTo('source', id).first()

          if (this.shareObject) {
            this.shareModel = this.shareObject.toJSON()
          } else {
            this.shareModel = _.defaults(this.shareModel, {
              password: null,
              width: 500,
              height: 500
            })
          }

          this.sharePassword = this.shareModel.password
          this.width = this.shareModel.width || 500
          this.height = this.shareModel.height || 500

        } catch ({ message }) {
          this.$message.error(message)
          this.isOpening = false
        }

        this.isLoading = false
      })
    },
    savePassword () {
      this.isSavingPassword = true
      this.saveModel({
        password: this.sharePassword
      })
      this.isSavingPassword = false
    },
    saveWidthHeight () {
      this.saveModel({
        width: this.width,
        height: this.height
      })
    },
    randomPassword () {
      this.sharePassword = NanoId(6)
    },
    async createShareLink () {
      this.isCreateShareLink = false
      this.saveModel({ link: NanoId(10) })
    },
    onSwitchLinkShare (isOpen) {
      var changes = { shareWithLink: isOpen }

      if (isOpen) {
        if (!this.shareModel.link) {
          changes.link = NanoId(10)
        }
      }

      this.saveModel(changes)
    },
    onSwitchPictureShare (isOpen) {
      var changes = { shareWithPicture: isOpen }

      if (isOpen) {
        if (!this.shareModel.picture) {
          changes.picture = NanoId(10)
        }
      }

      this.saveModel(changes)
    },
    onSwitchMediaShare (isOpen) {
      var changes = { shareWithMedia: isOpen }
      this.saveModel(changes)
    },
    copyToClipboard (text) {
      copyToClipboard(text)

      this.$message.success('已复制到剪切板')
    },
    async saveModel (changes) {
      try {
        this.shareObject = await ShareApi.update(this.shareObject, {
          source: this.sourceId,
          ...changes
        })

        this.shareModel = this.shareObject.toJSON()

        await this.$store.dispatch('works/update', {
          id: this.sourceId,
          share: this.shareObject
        })

        this.$message.success('设置已保存')
      } catch (error) {
        this.$catch(error)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.share {
  padding: 0 16px;
}
</style>
<style lang="scss">
.share {
  .el-tabs__content {
    padding-left: 16px !important;
  }
}
</style>



