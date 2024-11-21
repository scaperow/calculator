<template>
  <div class="d-flex flex-column align-space-between flex-grow-1 grey lighten-4">
    <hair :dark="false"></hair>
    <div class="flex-grow-1 d-flex justify-center price-list white">
      <div class="d-flex flex-column flex-md-row align-center justify-md-center">
        <v-card
          width="300"
          height="460"
          color="blue"
          dark
          class="d-flex flex-column justify-space-between"
        >
          <v-card-title class="justify-center align-center" style="height:180px">
            <div class="staff">免费方案</div>
            <h2>0</h2>
            <h4>元/永久</h4>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <ul>
              <li>文件数量无上限</li>
              <li>全部蓝图主题</li>
              <li>自动保存</li>
              <li>分享</li>
              <li>导出高清图片</li>
              <li>导出高清PDF文件</li>
              <li>导出高清SVG文件</li>
            </ul>
          </v-card-text>
        </v-card>
        <v-card
          width="300"
          height="460"
          color="blue"
          dark
          class="d-flex flex-column justify-space-between"
        >
          <v-card-title class="justify-center align-center" style="height:180px">
            <div class="staff">功能付费</div>
            <h4>可自由组合功能</h4>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <ul>
              <li
                v-for="feature in features"
                :key="feature.objectId"
                class="d-flex flex-row justify-space-between"
              >
                <label>
                  <v-icon
                    v-show="isChoose"
                    style="cursor"
                    v-ripple
                    @click="chooseItem(feature)"
                  >{{(chooseItems.indexOf(feature)>-1) ? 'mdi-checkbox-marked-circle': 'mdi-checkbox-blank-circle'}}</v-icon>
                  {{feature.label}}
                </label>
                <span v-show="isChoose">
                  <label style="font-size:14px">{{feature.price}}</label>
                  <label style="font-size:12px">元/年</label>
                </span>
              </li>
            </ul>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              depressed
              block
              large
              rounded
              @click="isChoose = true"
              v-show="!isChoose"
            >选购功能</v-btn>
            <div v-show="isChoose && choosePrice <= 0" class="ma-2">
              <v-icon class="mr-2">mdi-alert-circle-outline</v-icon>请选择要购买的功能
            </div>
            <v-btn
              color="primary"
              depressed
              block
              large
              rounded
              v-show="isChoose && choosePrice > 0"
              @click="payChoose()"
            >支付 {{choosePrice}} 元</v-btn>
          </v-card-actions>
        </v-card>
        <v-card
          width="300"
          height="460"
          color="blue"
          dark
          class="d-flex flex-column justify-space-between"
        >
          <v-card-title class="justify-center align-center" style="height:180px">
            <div class="staff">功能买断</div>

            <h2>99</h2>
            <h4>元/年</h4>
          </v-card-title>
          <v-card-text class="flex-grow-1">
            <ul>
              <li v-for="feature in features" :key="feature.objectId">{{feature.label}}</li>
            </ul>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-btn color="primary" depressed block large rounded @click="payout">购买</v-btn>
          </v-card-actions>
        </v-card>
      </div>
      <v-dialog persistent max-width="860" v-model="isPay">
        <v-card>
          <v-card-title>收银台</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column flex-sm-row justify-sm-space-around">
              <v-list>
                <v-subheader>购买项目</v-subheader>
                <v-list-item v-for="feature in payItems" :key="feature.objectId">
                  <v-list-item-icon>
                    <v-icon color="success">mdi-check</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>{{feature.label}}</v-list-item-content>
                </v-list-item>
              </v-list>
              <v-divider :vertical="$vuetify.breakpoint.smAndUp"></v-divider>
              <div class="d-flex flex-column justify-space-around">
                <div>
                  <v-subheader>购买时长</v-subheader>
                  <v-btn-toggle v-model="payYears" group>
                    <v-btn text :value="off.year" v-for="off in paymentOffs" :key="off.objectId">
                      <v-icon v-show="payYears == off.year" color="success">mdi-check</v-icon>
                      <label>{{off.year}}年</label>
                      <i v-if="off.offPoint === 1">(无折扣)</i>
                      <i v-else>{{`(${off.offPoint* 100} 折)`}}</i>
                    </v-btn>
                  </v-btn-toggle>
                </div>
                <div>
                  <v-subheader>付款方式</v-subheader>
                  <v-btn-toggle class="payment">
                    <v-btn outlined value="alipay">
                      <div style="color:#00aaee;">
                        <i class="iconfont icon-alipay"></i>
                        <label>支付宝</label>
                      </div>
                    </v-btn>
                    <v-btn outlined value="wechat">
                      <div style="color:#19c105;">
                        <i class="iconfont icon-wechat-pay"></i>
                        <label>微信</label>
                      </div>
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions
            class="pa-8 d-flex flex-column align-end flex-sm-row align-sm-end justify-sm-space-between"
          >
            <div class="d-flex flex-row align-end">
              <label>合计</label>
              <strong class="price">{{payResume}}</strong>
              <small class="ml-2">
                已优惠
                <i class="price">{{payOffset}}</i>
              </small>
            </div>
            <div>
              <v-btn color="primary">支付</v-btn>
              <v-btn text @click="isPay = false">取消</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <foot class="flex-grow-0" :dark="false"></foot>
  </div>
</template>
<script>
import UserAvatar from "../components/UserAvatar";
import Foot from "../components/Foot";
import Hair from "../components/Hair";
import { mapGetters } from "vuex";
import Parse from "parse";
const FeatureClass = Parse.Object.extend("feature");
const PaymentOffClass = Parse.Object.extend("paymentOff");
export default {
  data() {
    return {
      isPay: false,
      features: [],
      isChoose: false,
      chooseItems: [],
      payItems: [],
      payPrice: 0,
      paymentOffs: [],
      payYears: 1
    };
  },
  computed: {
    ...mapGetters({
      user: "user/user"
    }),
    payResume() {
      var offPoint = 1;
      var payOff = _.find(this.paymentOffs, { year: this.payYears });
      if (payOff) {
        offPoint = payOff.offPoint;
      }

      return parseFloat(this.payPrice * this.payYears * offPoint).toFixed(2);
    },
    payOffset() {
      return parseFloat(
        parseFloat(this.payPrice * this.payYears) - parseFloat(this.payResume)
      ).toFixed(2);
    },
    choosePrice() {
      var buyout = false;
      if (this.chooseItems.length === this.features.length) {
        buyout = true;
      }

      return _.reduce(
        this.chooseItems,
        (total, feature) => {
          total += buyout ? feature.buyoutPrice : feature.price;

          return total;
        },
        0
      );
    }
  },
  components: {
    UserAvatar,
    Foot,
    Hair
  },
  methods: {
    async getData() {
      var list = [];
      try {
        list = await new Parse.Query(FeatureClass).find();
      } catch (error) {
        this.$catch(error);
      }

      this.features = _.map(list, item => item.toJSON());

      try {
        list = await new Parse.Query(PaymentOffClass).find();
      } catch (error) {
        this.$catch(error);
      }

      this.paymentOffs = _.map(list, item => item.toJSON());
    },
    chooseItem(feature) {
      var index = this.chooseItems.indexOf(feature);
      if (index > -1) {
        this.chooseItems.splice(index, 1);
      } else {
        this.chooseItems.push(feature);
      }
    },
    payChoose() {
      this.payItems = _.cloneDeep(this.chooseItems);
      this.payPrice = this.choosePrice;

      this.isPay = true;
    },
    payout() {
      this.payItems = _.cloneDeep(this.features);
      this.payPrice = _.reduce(
        this.payItems,
        (total, feature) => {
          total += feature.buyoutPrice;

          return total;
        },
        0
      );

      this.isPay = true;
    }
  },
  created() {
    //this.getData();
  }
};
</script>
<style lang="scss" scoped>
.price-list {
  .v-card {
    margin: 12px;
  }
}

ul {
  li {
    line-height: 32px;
  }
}
.price-table-featured div {
  margin: 10px 0;
  font-size: 14px;
  font-weight: lighter;
}

h2 {
  font-size: 48px;
  font-weight: 200;
  padding: 12px;
}

h4 {
  font-size: 16px;
  font-weight: 200;
}

.staff {
  letter-spacing: 6px;
  font-size: 20px;
  font-weight: 100;
  border-bottom: 40px solid #e3f2fd;
  color: #0d47a1;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  height: 0;
  width: 220px;
  line-height: 40px;
  text-align: center;
  transform: rotate(-45deg);
  position: absolute;
  top: 40px;
  left: -50px;
}

.payment {
  .iconfont {
    font-size: 24px;
  }

  label {
    font-size: 16px;
    margin-left: 6px;
  }
}

.price {
  margin: 0 2px;
  &::after {
    content: "元";
  }
}
</style>