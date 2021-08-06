<script>
  import {
  h,
  onMounted,
  onUnmounted,
  reactive,
  withDirectives,
  ref
} from 'vue'

  const useGameLoop = update => {
  const state = reactive({
  requestId: 0,
  isRunning: false,
  then: 0,
  fpsRate: null
})
  const frame = now => {
  const tolerance = 0.1
  const interval = 1000 / self.fpsRate
  if (now - tolerance > state.then + interval) {
  state.then = now
  update((now + interval) % state.then)
}
  self.requestId = requestAnimationFrame(frame)
}
  const start = ({
  fpsRate = 60
}) => {
  self.fpsRate = fpsRate
  self.isRunning = true
  self.requestId = requestAnimationFrame(frame)
}
  const pause = () => {
  if (state.isRunning) {
  cancelAnimationFrame(state.requestId)
  state.isRunning = false
}
}
  return { start, pause }
}

  function debounce (
  func,
  wait
  ) {
  let timeout
  return (...args) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => func(...args), wait)
}
}

  /* function createCanvas ({
  scale = 32,
  rows = 8,
  cols = 8
} = {}) {
  return h('canvas', {
  height: rows * scale,
  width: cols * scale
})
} */

  /* function useWindowResize () {
  const height = ref(0)
  const width = ref(0)
  const handler = debounce(() => {
  height.value = window.innerHeight
  width.value = window.innerWidth
}, 50)
  onMounted(() => {
  handler()
  window.addEventListener('resize', handler)
})
  const remove = () => window && window.removeEventListener('resize', handler)
  onUnmounted(remove)
  return { height, width, remove }
} */

  const resize = {
  beforeMount (el, binding) {
  const handler = binding.value
  window.addEventListener('resize', handler)
  if (!binding.modifiers || !binding.modifiers.quiet) {
  handler()
}
},
  unmounted (el, binding) {
  window.removeEventListener('resize', binding.value)
}
}

  export default {
  name: 'App',
  setup () {
  const fps = ref(0)
  const canvas = h('canvas', {
  height: 512,
  width: 512
})
  const render = () => {
  const { width, height } = canvas.el
  const ctx = canvas.el.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 20, 20)
  ctx.fill()
}
  const tick = deltaT => {
  fps.value = deltaT
  render()
}
  const resizeHandler = debounce(() => {
  canvas.el.height = window.outerHeight
  canvas.el.width = window.outerWidth
}, 50)
  const gameLoop = useGameLoop(tick)
  onMounted(() => {
  gameLoop.start({ fpsRate: 10 })
})
  onUnmounted(() => {})
  const nodes = h('div', {
  class: ['container']
}, [
  canvas,
  h('div', {
  style: {
  position: 'absolute',
  top: 0,
  left: 0,
  color: 'white'
}
}, fps.value)
  ])
  return () => [
  withDirectives(nodes, [
  [resize, resizeHandler]
  ])
  ]
}
}

</script>

<style lang="scss">
  * {
  box-sizing: border-box;
}
  body {
  background: #121212;
}
  body, div {
  margin: 0;
  padding: 0;
}
  #app {
  font-family: Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
  canvas {
  display: block;
}
  .container {
  width: 100%;
  height: 100%;
}
</style>
