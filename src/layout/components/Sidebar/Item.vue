<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      vnodes.push(<svg-icon icon-class={icon}/>)
    }

    // 这里的slot创建之后就是一个具名slot?， 
    // 这是将span传给子组件中name为title的slot? 
    // 纠结的点： 这里是作为一个子节点使用还是作为一个父节点使用
    // 如果是作为一个父节点使用的话， 这里就没有子节点了
    if (title) {
      vnodes.push(<span slot='title'>{(title)}</span>)
    }
    return vnodes
  }
}
</script>
