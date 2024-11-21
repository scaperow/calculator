import Vuex from 'vuex'
import user from './modules/user'
import go from './modules/go'
import style from './modules/style'
import maps from './modules/maps'
import works from './modules/works'
import overlay from './modules/overlay'
import history from './modules/history'
import shape from './modules/shape'
import icon from './modules/icon'
import products from './modules/products'
import orders from './modules/orders'
import customers from './modules/customers'

export default () => new Vuex.Store({
  modules: {
    user,
    go,
    style,
    maps,
    overlay,
    works,
    history,
    shape,
    icon,
    products,
    customers,
    orders
  }
})