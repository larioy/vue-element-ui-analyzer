<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <!-- 如果路由设置了不需要重定向(error_page)或这是匹配理由里面的最后一个数组元素
        说明当前显示的页面就是最后的一个匹配路由的url,所以不需要添加链接a属性，
        不过这一个好像面包屑是内部做了处理的，最后一个默认是没有link的属性的，
        在这里其实可以不用设置 -->
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null
    }
  },
  //使用watch，当路由改变的时候都动态的更新面包屑的levellist中匹配的路由
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  //当登录进入主页页面，加载面包屑组件第一次也需要使用面包屑。因为是单页面，
  //只会更新部分页面，所以breadcrumb是不需要再加载，created只会创建一次。
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      //这里的match是匹配从根路径过程中的每一个route。
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      //匹配的第一个是根路由。要判断/dashboard否在匹配的路由里面，所以是通过
      //根路由的，dashboard是在根路由
      const first = matched[0]

      if (!this.isDashboard(first)) {
        //如果dashboard不在匹配的路径里面，那么将dashboard给插入到匹配数组
        //的第一项。表现的现象为：在面包屑的第一项始终都有dashboard这一个router-link
        matched = [{ path: '/dashboard', meta: { title: 'Dashboard' }}].concat(matched)
      }

    //再次在匹配的路由里面过滤要在面包屑上要展示的，路由。这里使用route里的meta的breadcrumb属性
      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    //判断当前路由是否是dashboard，是的时候bashboard有什么特别的吗？
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      //主要考虑分开处理重定向的情况
      if (redirect) {
        //使用函数式编程，作用是和router-link的一致。理解为一个路由跳转就ok
        this.$router.push(redirect)
        return
      }
      //修复bug，进入详情后返回上一级，id丢失的情况
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
