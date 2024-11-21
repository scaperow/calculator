<template>
  <v-container>
    <v-tabs>
      <v-tab>收/发货</v-tab>
      <v-tab>价目表</v-tab>
      <v-tab>客户</v-tab>
      <v-tab>结算</v-tab>
      <v-tab-item>
        <v-row>
          <v-col cols="4">
            <v-select
              label="客户"
              v-model="selectCustomerId"
              :items="customers"
              item-text="name"
              item-value="objectId"
            ></v-select>
            <v-card>
              <v-card-title v-if="orderModel.flow === 'out'">发货</v-card-title>
              <v-card-title v-if="orderModel.flow === 'in'">收货</v-card-title>
              <v-card-title v-if="!orderModel.flow">收/发货</v-card-title>
              <v-card-text>
                <v-date-picker
                  :first-day-of-week="0"
                  locale="zh-cn"
                  label="时间"
                  type="date"
                  :value="orderModel.dateTime"
                  @change="dateTime=>orderModel.dateTime =dateTime"
                ></v-date-picker>
                <v-radio-group v-model="orderModel.flow">
                  <v-radio label="收货" value="in"></v-radio>
                  <v-radio label="发货" value="out"></v-radio>
                </v-radio-group>
                <v-row v-for="(item,index) in orderModel.items" :key="'items'+ index">
                  <v-col>
                    <v-select
                      item-text="name"
                      item-value="objectId"
                      :items="products"
                      v-model="item.product"
                      label="物品"
                    ></v-select>
                  </v-col>
                  <v-col>
                    <v-text-field type="number" v-model="item.count" label="数量"></v-text-field>
                  </v-col>
                  <v-col v-if="orderModel.flow === 'in'">
                    <v-text-field type="number" v-model="item.brokenCount" label="损坏"></v-text-field>
                  </v-col>
                  <v-col>
                    <v-btn text icon @click="addItem">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <v-btn text icon @click="removeItem(index)" v-if="index !== 0">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="addOrder">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="8">
            <v-timeline v-if="ordersTimeline">
              <v-timeline-item
                v-for="(order,index) in ordersTimeline "
                :left="order.flow==='in'"
                :right="order.flow==='out'"
                :key="'timeline'+index"
              >
                <v-card>
                  <v-card-title v-if="order.flow === 'in'">收货</v-card-title>
                  <v-card-title v-if="order.flow === 'out'">发货</v-card-title>
                  <v-card-text>
                    {{order.dateTime}}
                    <div
                      v-for="(product,itemIndex) in order.items"
                      :key="'orderTimeline'+itemIndex"
                    >{{product.name }} :{{product.count}} {{product.unit}}</div>
                    <v-divider></v-divider>数量小计
                    <div
                      v-for="(category,totalIndex) in order.categories"
                      :key="'subTotalTimeline'+totalIndex"
                    >{{category.name}} : {{category.total}}{{category.unit}}</div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn @click="removeOrder(order.objectId)">删除</v-btn>
                  </v-card-actions>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item>
        <v-row>
          <v-col>
            <v-card max-width="320">
              <v-card-title>价目组</v-card-title>
              <v-card-text>
                <v-text-field v-model="categoryModel.name" label="名称"></v-text-field>
                <v-text-field v-model="categoryModel.unit" label="单位"></v-text-field>
                <v-text-field
                  :label="`租费/${categoryModel.unit || '[单位]'}/天`"
                  v-model="categoryModel.price"
                ></v-text-field>
                <v-text-field
                  :label="`损坏费用/${categoryModel.unit || '[单位]'}`"
                  v-model="categoryModel.brokenPrice"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="saveProductCategory">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col>
            <v-card max-width="320">
              <v-card-title v-if="productModel.objectId">编辑价目</v-card-title>
              <v-card-title v-else>增加价目</v-card-title>
              <v-card-text>
                <v-select
                  clearable
                  item-value="objectId"
                  item-text="name"
                  label="组别"
                  v-model="productModel.category"
                  :items="categories"
                ></v-select>
                <v-text-field label="建材名称" v-model="productModel.name"></v-text-field>
                <v-text-field label="单位" v-model="productModel.unit"></v-text-field>
                <div v-if="productModel.category">
                  <v-text-field v-model="productModel.categoryUnit" label="转换因子"></v-text-field>
                </div>
                <div v-else>
                  <v-text-field label="租费/天" v-model="productModel.price"></v-text-field>
                  <v-text-field label="损坏费用/天" v-model="productModel.brokenPrice"></v-text-field>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="saveProduct">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-data-table
          hide-default-footer
          disable-pagination
          :headers="productTitles"
          :items="products"
        >
          <template v-slot:item.action="{ item }">
            <v-icon small @click="editProduct(item)">mdi-pencil</v-icon>
          </template>
        </v-data-table>
      </v-tab-item>
      <v-tab-item>
        <v-row>
          <v-col cols="4">
            <v-card>
              <v-card-title>增加客户</v-card-title>
              <v-card-text>
                <v-text-field label="名称" v-model="customerModel.name"></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="saveCustomer">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col>
            客户列表
            <v-data-table
              hide-default-footer
              disable-pagination
              :headers="customerHeaders"
              :items="customers"
            >
              <template v-slot:item.action="{ item }">
                <v-icon small @click="updateCustomer(item)">mdi-pencil</v-icon>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item>
        <v-row>
          <template v-for="(product,index) in products">
            <v-text-field
              v-if="!product.category"
              style="max-width:120px"
              hide-details
              :value="product.price"
              @change="(price)=>setProductPrice(price,product,index)"
              type="number"
              :label="`${product.name}单价(元/${product.unit})`"
              :key="'product'+index"
            ></v-text-field>
          </template>

          <template v-for="(category,index) in categories">
            <v-text-field
              style="max-width:100px"
              hide-details
              :value="category.price"
              @change="(price)=>setCategoryPrice(price,category,index)"
              type="number"
              :label="`${category.name}单价(元/${category.unit})`"
              :key="'category'+index"
            ></v-text-field>
          </template>
        </v-row>

        <div class="title" v-if="selectCustomer">
          <h2 class="text-center">{{`${selectCustomer.name} 租赁结算单`}}</h2>
        </div>
        <div v-if="calculateTotal" class="text-right">
          <div v-for="(product,index) in calculateTotal.products" :key="'calculateTotal'+index">
            <label>{{product.name +'费用:￥'+product.total+'元'}}</label>
          </div>
          合计 {{calculateTotal.total}}
        </div>

        <div v-for="(table,index) in calculateTable" :key="'calculate'+index">
          <v-card-text slot="header" class="text-center">
            <h2>{{`${table.name}结算单`}}</h2>
          </v-card-text>

          <v-data-table
          
            hide-default-footer
            disable-pagination
            :items="table.list"
            :headers="calculateHeaders"
          ></v-data-table>
          <v-divider></v-divider>
          <v-card-text slot="footer">
            <div>单价 {{table.price}}</div>
            <div>下欠数量 {{table.remainCount}}</div>
            <div>合计 {{table.total}}</div>
          </v-card-text>
        </div>
        <!--  -->

        <!-- <v-btn @click="startCalculate">计算</v-btn> -->
      </v-tab-item>
    </v-tabs>
    <div></div>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";
export default {
  data() {
    return {
      salesPriceList: [],
      selectCustomerId: {},
      customerModel: {},
      categoryModel: {},
      productModel: {},
      customerHeaders: [
        {
          text: "名称",
          align: "left",
          sortable: false,
          value: "name"
        },
        {
          text: "操作",
          align: "left",
          sortable: false,
          value: "action"
        }
      ],
      calculateHeaders: [
        // {
        //   text: "建材",
        //   value: "name"
        // },

        {
          text: "起始",
          value: "startTime",
          width:'120'
        },
        {
          text: "截至",
          value: "endTime",
          width:'120'
        },
        {
          text: "天数",
          value: "days",
          width:'40'
        },
        // {
        //   text: "下欠数量",
        //   value: "remainCount",
        //   width:'60'
        // },
        // {
        //   text: "使用数量",
        //   value: "count",
        //   width:'120'
        // },
        {
          text: "费用小计",
          value: "total",
          
        }
      ],
      productTitles: [
        {
          text: "名称",
          align: "left",
          sortable: false,
          value: "name"
        },
        { text: "租赁费用/天", value: "price" },
        { text: "损坏费用", value: "brokenPrice" },
        { text: "单位", value: "unit" },
        { text: "组别", value: "category" },
        { text: "转换因子", value: "categoryUnit" },
        { text: "操作", value: "action", sortable: false }
      ],
      orderModel: {
        dateTime: moment().format("YYYY-MM-DD"),
        items: [{}]
      }
    };
  },
  watch: {
    selectCustomerId() {
      this.$store.dispatch("orders/getList", {
        customerId: this.selectCustomerId
      });
    }
  },
  computed: {
    ordersTimeline() {
      var products = this.products;
      var orders = this.orders;
      var categories = this.categories;

      return _.chain(orders)
        .reduce((result, order) => {
          var timeOrder = _.find(result, {
            dateTime: order.dateTime,
            flow: order.flow
          });
          if (!timeOrder) {
            timeOrder = {
              dateTime: order.dateTime,
              items: [],
              flow: order.flow
            };

            result.push(timeOrder);
          }

          timeOrder.items = [...timeOrder.items, ...order.items];

          return result;
        }, [])

        .each(order => {
          order.items = _.reduce(
            order.items,
            (result, item, index) => {
              var product = _.find(result, { product: item.product });

              if (!product) {
                product = { ...item };
                product.count = 0;

                result.push(product);
              }

              product.count =
                parseFloat(product.count) + parseFloat(item.count || 0);

              return result;
            },
            []
          );
        })
        .map(order => {
          return {
            ..._.pick(order, "objectId", "dateTime", "flow"),
            items: _.map(order.items, item => {
              return {
                ..._.pick(
                  _.find(products, { objectId: item.product }),
                  "name",
                  "unit",
                  "objectId",
                  "category",
                  "categoryUnit",
                  "price"
                ),
                count: item.count
              };
            })
          };
        })
        .map(order => {
          order.categories = _.reduce(
            order.items,
            (result, current, index) => {
              var category = null;

              if (current.category) {
                category = _.find(result, { id: current.category });
                if (!category) {
                  var { name, unit, price } = _.find(categories, {
                      objectId: current.category
                    }),
                    category = {
                      id: current.category,
                      name,
                      price,
                      unit,
                      items: []
                    };

                  result.push(category);
                }

                category.items.push(current);
                category.total =
                  _.toNumber(category.total || 0) +
                  _.toNumber(current.count) * _.toNumber(current.categoryUnit);

                category.total = parseFloat(category.total.toFixed(2));
              }

              return result;
            },
            []
          );

          return order;
        })
        .orderBy(["dateTime"], ["asc"])
        .value();
    },
    selectCustomer() {
      return _.find(this.customers, { objectId: this.selectCustomerId });
    },
    calculateTable() {
      var endTime = moment().format("YYYY-MM-DD");
      var orders = _.reduce(
        this.ordersTimeline,
        (result, order, index) => {
          _.each(order.categories, category => {
            var count = order.flow === "out" ? category.total : -category.total;
            result.push({
              name: category.name,
              dateTime: order.dateTime,
              flow: order.flow,
              count,
              unit: category.unit,
              price: category.price
            });
          });

          _.each(order.items, item => {
            if (!item.category) {
              var count = order.flow === "out" ? item.count : -item.count;
              result.push({
                name: item.name,
                dateTime: order.dateTime,
                flow: order.flow,
                count,
                unit: item.unit,
                price: item.price
              });
            }
          });

          return result;
        },
        []
      );

      var inOrders = _.groupBy(
        _.filter(orders, order => order.flow === "in"),
        order => order.name
      );

      var outOrders = _.groupBy(
        _.filter(orders, order => order.flow === "out"),
        order => order.name
      );

      var groupOrders = _.groupBy(orders, order => order.name);

      return _.map(groupOrders, (array, itemName) => {
        var price = 0;
        var remainCount = 0;
        var firstOrder = null;
        var array = groupOrders[itemName] || [];
        var startTime = null;
        var list = _.chain(array)
          .reduce((result, order, index) => {
            var useCount = 0;
            var days = 0;

            if (index === 0) {
              startTime = order.dateTime;
              remainCount = order.count;
              firstOrder = order;
            } else if (index === array.length - 1) {
              useCount = remainCount;
              remainCount = remainCount + order.count;
              days =
                moment
                  .duration(moment(order.dateTime) - moment(startTime))
                  .days() + 1;

              result.push({
                startTime,
                endTime: order.dateTime,
                days,
                count: useCount,
                unit: order.unit,
                remainCount,
                total: parseFloat(
                  parseFloat(
                    _.toNumber(useCount) * _.toNumber(order.price) * days
                  ).toFixed(2)
                )
              });

              startTime = order.dateTime;
            } else {
              useCount = remainCount;
              remainCount = remainCount + order.count;
              days =
                moment
                  .duration(moment(order.dateTime) - moment(startTime))
                  .days() + 1;

              result.push({
                startTime,
                endTime: order.dateTime,
                days,
                count: useCount,
                unit: order.unit,
                remainCount,
                total: parseFloat(
                  parseFloat(
                    _.toNumber(useCount) * _.toNumber(order.price) * days
                  ).toFixed(2)
                )
              });

              startTime = order.dateTime;
            }

            return result;
          }, [])
          .value();

        if (remainCount > 0) {
          var days =
            moment.duration(moment(endTime) - moment(startTime)).days() + 1;

          list.push({
            startTime,
            endTime,
            days,
            count: remainCount,
            unit: firstOrder.unit,
            remainCount,
            total: parseFloat(
              parseFloat(
                _.toNumber(remainCount) * _.toNumber(firstOrder.price) * days
              ).toFixed(2)
            )
          });
        }

        var total = _.reduce(
          list,
          (result, row) => {
            result = parseFloat(
              _.toNumber(result) + _.toNumber(row.total)
            ).toFixed(2);
            return result;
          },
          0
        );

        return {
          price: firstOrder.price,
          name: itemName,
          list,
          total,
          remainCount
        };
      });
    },
    calculateTotal() {
      return _.reduce(
        this.calculateTable,
        (result, row, index) => {
          result.total = parseFloat(
            parseFloat(
              _.toNumber(result.total) + _.toNumber(row.total)
            ).toFixed(2)
          );
          result.products.push({
            name: row.name,
            total: row.total
          });
          return result;
        },
        { products: [], total: 0 }
      );
    },
    ...mapGetters({
      products: "products/list",
      categories: "products/categoryList",
      orders: "orders/list",
      customers: "customers/list"
    })
  },
  created() {
    this.$store.dispatch("products/getList");
    this.$store.dispatch("products/getCategoryList");
    this.$store.dispatch("customers/getList");
  },
  methods: {
    editProduct(item) {
      this.productModel = _.cloneDeep(item);
    },
    addOrder() {
      if (_.isEmpty(this.selectCustomerId)) {
        this.$message.error("请选择客户");
        return;
      }

      if (_.isEmpty(this.orderModel.flow)) {
        this.$message.error("请选择收货还是发货");
        return;
      }
      if (!this.orderModel.dateTime) {
        this.$message.error("请选择时间");
        return;
      }

      if (_.isEmpty(this.orderModel.items)) {
        this.$message.error("情至少选择一项建材");
        return;
      }

      this.orderModel.customerId = this.selectCustomerId;
      this.$store.dispatch("orders/add", this.orderModel);
    },
    addItem() {
      this.orderModel.items.push({});
    },
    removeItem(index) {
      this.orderModel.items.splice(index, 1);
    },
    removeOrder(orderId) {
      this.$store.dispatch("orders/remove", orderId);
    },
    removeProduct({ objectId }) {
      this.$store.dispatch("products/remove", objectId);
    },
    removeCustomer({ objectId }) {
      this.$store.dispatch("customers/remove", objectId);
    },
    updateCustomer({ objectId }) {
      this.customerModel = _.find(this.customers, {
        objectId
      });
    },
    setProductPrice(price, product, index) {
      //var product =  this.products[index]
      //this.products
      product.price = price;
      this.$store.dispatch("products/setCalculatePrice", product);
    },
    setCategoryPrice(price, category, index) {
      //var product =  this.products[index]
      //this.products
      category.price = price;
      this.$store.dispatch("products/setCategoryCalculatePrice", category);
    },
    async saveProductCategory() {
      try {
        await this.$store.dispatch("products/addCategory", this.categoryModel);
      } catch (error) {
        this.$catch(error);
      }
    },
    async saveProduct() {
      try {
        if (this.productModel.objectId) {
          await this.$store.dispatch("products/update", this.productModel);
          this.productModel={}
        } else {
          await this.$store.dispatch("products/add", this.productModel);
        }
      } catch (error) {
        this.$catch(error);
      }
    },
    async saveCustomer() {
      try {
        if (this.customerModel.objectId) {
          await this.$store.dispatch("customers/update", this.customerModel);
          this.customerModel = {};
        } else {
          await this.$store.dispatch("customers/add", this.customerModel);
        }
      } catch (error) {
        this.$catch(error);
      }
    }
  }
};
</script>