import _ from 'lodash'
export default function ({ store, redirect }) {
  // If the user is not authenticated

  return new Promise(async (resolve, reject) => {
    var user = await store.dispatch('user/getUser')
    if (!user) {
      redirect('/login')
      // reject()
    }

    resolve(true)
  })


  // const { store, redirect } = context
  // var accessRoles = []//_.get(to, 'meta.roles')
  // var roles = [];
  // //console.log(app)
  // // console.log(context.route)


  // var user = await store.dispatch('user/getUser')

  // if (!_.isEmpty(accessRoles)) {
  //   if (_.isArray(roles)) {
  //     if (_.isEmpty(currentUser)) {
  //       store('/login')
  //     } else {
  //       if (_.intersection(accessRoles, roles).length <= 0) {
  //         store('/403')
  //       }
  //     }
  //   }
  // }
}