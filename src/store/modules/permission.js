import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
// 公共路由是没有在meta里面设置一个roles的， 可以直接进行访问， 所以直接返回true，
// 但是在需要进行权限访问的页面就是判断当前角色是否为在roles数组里面， 在就是拥有权限
// 这里使用的是some进行判断， 只要有一个roles在route的roles数组里面就ok了
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes 所有需要进行角色权限校验的数组
 * @param roles
 */
// 函数功能： 根据角色过滤该角色拥有访问权限的路由。 这里使用递归调用， 因为路由里面使用的嵌套路由，
// 所以需要保证将子路由的权限也给包括进去。 注意的点： 子路由的路径的生成是一个相对的相对于父组件的
// 查看router/index.js文件可以发现子路由是"create"， 并没有/, 其是和父路由做拼接的。
// 注意点二： router.children也是route类型的
// 根据递归， 可以发现最终的授权表示长路径的访问在前， 短的父路径在后
// []
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    // 这里使用tmp的原因： 不能污染route
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      // 这里的这个递归是想干什么的， 没有看懂 ----> 见上文的分析
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // 在creatRoutes函数是直接创建共用的routes,这里根据角色生成了
    // 权限路由，那就是将新的权限路由给添加到， 所以使用concat函数
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 这获取权限路由为什么要使用一部的promise？
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
