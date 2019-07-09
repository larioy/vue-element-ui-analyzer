router
	- 目录分析
		- modules： 这个文件夹主要是用来存放组件的router， 比如复杂一点的table(多种类的)， 然后是chart.js里面的
		- index.js： 总的文件router， 
			- 路由的分类
				- 不需要权限的公共组件的访问， constantRouters数组
				- 需要权限的组件： asyncRouters数组
					- 作用： 根据角色生成可以访问的额动态路由
	- 路由的作用：
		- 一： 根据路由和用户的权限动态的生成侧边栏的可以访问的路由
		- 二： 使用到的地方： permission
	- 路由里面的每一个配置项的说明
		 * Note: sub-menu only appear when route children.length >= 1
		 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
		 *
		 * hidden: true                   设置为true的话， 该条路由就不会在侧边栏出现
		 * alwaysShow: true               如果为true就会一直在根菜单进行显示， 就会在侧边栏进行显示， 和公共组件是关联的， 
		 *                                if not set alwaysShow, when item has more than one children route,
		 *                                it will becomes nested mode, otherwise not show the root menu
		 * redirect: noRedirect           设置该值就不会重定向到面包屑, 这一点还没有理解。 什么叫重定向到面包屑？
		 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
		 * meta : {
		    roles: ['admin','editor']    control the page roles (you can set multiple roles)
		    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
		    icon: 'svg-name'             the icon show in the sidebar
		    noCache: true                if set true, the page will no be cached(default is false)
		    affix: true                  if set true, the tag will affix in the tags-view
		    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
		    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
		
	- 注意在创建路由的时候， 知识创建了一个公共页面的路由而已
		- 文件路径： router/index.js
		- const createRouter = () => new Router({
		  // mode: 'history', // require service support
		  scrollBehavior: () => ({ y: 0 }),
		  routes: constantRoutes
		})
    - route属性的使用： this.$route.match()函数， 得到的是匹配的路由的宿数组。 这个数组是从第一个根路由进行匹配， 根路由作为第一个数组元素
    	- 文件位置： src\components\Breadcrumb\index.vue
    	- 在此处的分析： 判断匹配的路由，举一个路由匹配的例子
    		const componentsRouter = {
				  path: '/components',
				  component: Layout,
				  redirect: 'noRedirect',
				  name: 'ComponentDemo',
				  meta: {
				    title: 'Components',
				    icon: 'component'
				  },
				  children: [
				    {
				      path: 'tinymce',
				      component: () => import('@/views/components-demo/tinymce'),
				      name: 'TinymceDemo',
				      meta: { title: 'Tinymce' }
				    },
				    {
				      path: 'markdown',
				      component: () => import('@/views/components-demo/markdown'),
				      name: 'MarkdownDemo',
				      meta: { title: 'Markdown' }
				    },
		- 前置条件： 上面的component是根路由， 比如这里在web界面点击左侧边栏的markdown，那么得到的matched的数组就是route的数组
			- 这里match的第一个就是下面这个路由
				path: '/components',
				  component: Layout,
				  redirect: 'noRedirect',
				  name: 'ComponentDemo',
				  meta: {
				    title: 'Components',
				    icon: 'component'
				  },
			- 第二个元素就是下面这个路由
				 path: 'markdown',
				      component: () => import('@/views/components-demo/markdown'),
				      name: 'MarkdownDemo',
				      meta: { title: 'Markdown'}
			- 注意的事项： 在match的数组中的route是可以获取他的父路由和子路由的， 相当于是一个完整的路由，对路由的操作在match的元素都是可以操作的、

permission
	- 原理： 使用路由导航的router.forEach(), 在每一次路由跳转前判断是否获取角色
	- 页面初始化：
		- 第一步： 首先页面是怎么进行加载的， 加载的顺序是什么， vue项目的入口文件是在哪里
		- 第二步： 是怎么进行不断的重定向的， 
	- 动态的加载权限路由
		- 第一步： 用户使用登录， 登录成功会拥有一个token
		- 第二步： 用户登录成功是否有角色，没有角色则通过异步获取后台的用户信息， 包括用户的角色、用户名等， 并保存在cookies里面
			- 通过store中的state获取角色， 通过在store中的action获取用户的信息(使用的是一个异步接口)
			- 文件位置： store/user.js
		- 第三步： 获取权限后， 根据用户的角色动态的生成权限路由
			- 根据上一步中的角色生成动态路由
			- 文件位置： store/module/permission.js
			generateRoutes({ commit }, roles) {
			    return new Promise(resolve => {
			      let accessedRoutes
			      // 如果是admin就是直接获取所有的路由
			      if (roles.includes('admin')) {
			        accessedRoutes = asyncRoutes || []
			      } else {
			      // 非admin用户则调用过滤路由的函数进行出路
			        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
			      }
			      // 更新路由
			      commit('SET_ROUTES', accessedRoutes)
			      resolve(accessedRoutes)
			    })
			  }
			- 疑问： 这里的设置state的routes是在哪里绑定为computed的？？ 还不知道在哪里被使用了， 见分析这里的state.routes是和permission_routes是等价的


permission+router+sidebar
	- 根据role动态生成router渲染侧边栏的界面
	- 文件路径： 
		- 侧边栏的总入口： src\layout\components\Sidebar\index.vue
		- 侧边栏的每一项
	- 使用的element组件： 
		- el-scrollbar: 官方没与该组件的使用用法， 参考文件： https://juejin.im/post/5b0c0adb6fb9a009ec7e9734
			-- 该组件的效果： 滚动框
			-- 该组件的作用： 将里面的菜单给包裹起来， 当菜单栏比较多个时候就是可以使用滚动
			-- 该组件在这里实现的注意点: 右边栏的滚动条幅比较小，这里几乎看不出来， 具体的设置
			- el-menu
				-- 该el-menu组件对应element官方文档里面的navmenu组件
				-- 注意这里使用的方式： 是在menu里面包裹作者自己编写的sidebar-item组件，在该组件每部对官方的el-menu-item进行了封装
				   在sidebar-item里面添加的了图标， 和添加一个app-link， 主要的作用： 增加鼠标防置到上面时的效果
				- 自定义的组件sidebar-item
                  - 对el-menu-item进行封装的原因
                  	--  判断是否为只有一个子路由， 或者是没有子路由， 是的话就只显示当前路由。 这一段的含义其实是没有怎么看懂的
                  	   <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
                  	- item组件
                  		- 使用render函数
                  			render(h, context) {
							    const { icon, title } = context.props
							    const vnodes = []

							    if (icon) {
							      vnodes.push(<svg-icon icon-class={icon}/>)
							    }
							    // 这里有疑问： 父组件中调用的使用有一个<template slot="title">， 这一个是老版本的vue使用的， 将该template里面的属性传递给slot
							    // 这里的这句vnodes.push(<span slot='title'>{(title)}</span>)是被渲染为子组件还会父组件？？
							    // 根据这里的场景应该是被渲染成了子组件，

							    if (title) {
							      vnodes.push(<span slot='title'>{(title)}</span>)
							    }
							    return vnodes
							  }
							}
					- link组件
						- link组件里面的component组件和is属性的用法与含义
						- 文件路径： src\layout\components\Sidebar\Link.vue
						- 参考资料： https://www.kancloud.cn/mrxuxu/vue_js/821508


导航条的原理
父组件的总入口： src\layout\components\Navbar.vue
-	结构
		- humburger: 左角的图标， 使用一个component组件实现
			- 文件路径： src\components\Hamburger\index.vue
			- 这个是当行栏左边有三杠加一个箭头的图标， 该图标绑定一个事件， 当点击该图标的时候可以将sidebar进行展开和关闭
			--------------  下面为一个父组件控制子组件的完整的交互过程， 可以作为一个demo
			- hunburger里面将点击事件emit给父组件， 父组件进行状态的更改， 修改store中siderbar的展开状态
				- 子组件： this.$emit("toggleClick")
				- 父组件:   @toggleClick="toggleSideBar"   @的是子组件发射出来的， 等号右边是父组件监听组件发射出来的method,
					- method通过store.dispatch("app/toggleSidebar") , 在里面更改子sidebar.opened的值 
					- 文件位置： src\store\modules\app.js
				- 父组件控制子组件的状态： 父组件传给子组件sidebar.opened, 该属性控制side的展开
			- 存在的疑问： 为什么在更改侧边栏的展开与否会使用cookies存储这个状态呢？？
		- 面包屑
			- 文件位置： src\components\Breadcrumb\index.vue
			- 使用的element-ui的组件： el-breadcrumb
			- 实现原理： 
				- 通过watch监控route的实时变化， 通过route.match来获取匹配的路由。 要在面包屑上面展示的数据
				- 知识点： route.match的含义， 见上面的分析
				- 作者修复的bug: 进入详情页面返回上一级的路由时路由path的id丢失的情况
				- 处理的边界情况： 最后一个match数组的路由不添加link属性， 重定向页面的出路
				- 函数式的路由编程： 使用router.push()跳转到下一个路由

		- 右边一次为一个搜索框、 一个屏的组件， 文本组件,     ------> 在界面的宽度达到多大的百分比后就会将这几个组件给隐藏， 动态地
			- 搜所框的实现： 自己编写一个search组件， 然后进行封装element-ui的组件
				- 图标组件： 添加点击事件， 当点击图标后显示所搜框
				- 搜索框组件： el-select， select选择器
					- 这里的搜索框的作用是拿来搜索路由的， 这个路由的搜索的实现分析如下。
                    - 搜索框实现的原理： 使用到了一个js的库， fust.js。 
                    	- 在watch中监控routes的变化， 同步修改searchpool的值， 然后同样是监控searchpool的值变化初始化new fust
                    	  得到一个要搜所的pool。
                    	- 然后在搜索框的函数里面绑定函数触发fust从pool中进行搜索
				- 实际的意义： 
					- 一般的搜索都是和后端交互的， 这里只需要读取输入框的值就ok， 不需要进行处理


			- errorlog
				- 通过读取错误数组的长度判断是否展示错误
				- 原理是使用table的element-ui组件来展示错误信息

			- 设置字体的大小
 
		- 下拉文本框
			- 下拉文本无分析



标签栏的实现
	- 知识点：大量的在父组件中调用子组件
	- 一个是taglist，该taglist存放的是每一个打开的页面的组件
	- 一个是visitedView， 这一个是存放已经访问的component的路由route
	- 实现的原理
		- 当打开标签时需要动态的添加标签和动态的关闭标签， 需要计算每一个标签的长度：？ 是否支持用鼠标改变标签的宽度

知识点 
	- watch的监控， 第一个参数和第二个参数含义
	- route。match的含义
	- 父组件控制子组件的demo