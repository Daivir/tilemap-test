export default {
  name: 'App',
  setup () {
    const scale = 32
    const cols = 8
    const rows = 8
    const canvas = h('canvas', {
      height: rows * scale,
      width: cols * scale
    }, 'Canvas not supported')
    const viewport = reactive({
      x: 0,
      y: 0,
      width: cols * scale,
      height: rows * scale
    })
    const entity = reactive({
      x: 0,
      y: 0
    })
    const update = deltaT => {
      render()
    }
    const gameLoop = useGameLoop(update)
    const startCol = computed(() => Math.floor(viewport.x / scale))
    const endCol = computed(() => startCol.value + (viewport.width / scale))
    const startRow = computed(() => Math.floor(viewport.y / scale))
    const endRow = computed(() => startRow.value + (viewport.height / scale))
    const offsetX = computed(() => -viewport.x + startCol.value * scale)
    const offsetY = computed(() => -viewport.y + startRow.value * scale)
    const render = () => {
      const ctx = canvas.el.getContext('2d')
      ctx.clearRect(0, 0, canvas.el.width, canvas.el.height)
      // grid
      ctx.beginPath()
      for (let c = startCol.value; c <= endCol.value; c++) {
        for (let r = startRow.value; r <= endRow.value; r++) {
          const x = (c - startCol.value) * scale + offsetX.value
          const y = (r - startRow.value) * scale + offsetY.value
          ctx.strokeStyle = '#fff'
          ctx.strokeRect(x, y, scale, scale)
          ctx.stroke()
        }
      }
      // char
      ctx.beginPath()
      ctx.fillRect(entity.x * scale, entity.y * scale, scale, scale)
      ctx.fillStyle = 'red'
      ctx.strokeStyle = 'transparent'
      ctx.fill()
    }
    const init = () => gameLoop.start({ fpsRate: 10 })
    onMounted(() => {
      init()
    })
    onUnmounted(() => {})
    return () => [canvas]
  }
}
