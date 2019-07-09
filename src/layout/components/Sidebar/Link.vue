
<template>
  <!-- eslint-disable vue/require-component-is -->
  <component v-bind="linkProps(to)">
    <!-- 这里的slot存放的是el-menu-item -->
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    linkProps(url) {
      // 如果是外部链接就使用a标签打开一个新的页面
      if (isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      // 如果不是外部链接就使用router-link在当前页面展开
      return {
        is: 'router-link',
        to: url
      }
    }
  }
}
</script>
