export default {
  name: 'App',
  components: {},
  setup () {
    // const canvas = ref(null)
    const onKeydown = (e) => {
      e.preventDefault()
      const keyCode = e.code
      if (keyCode === 'ArrowRight') {
        // keyboard.keys.ArrowRight = true
        game.dirX = 1
      }
      if (keyCode === 'ArrowLeft') {
        game.dirX = -1
      }
      if (keyCode === 'ArrowDown') {
        game.dirY = 1
      }
      if (keyCode === 'ArrowUp') {
        game.dirY = -1
      }
    }
    const onKeyUp = (e) => {
      e.preventDefault()
      const keyCode = e.code
      if (['ArrowRight', 'ArrowLeft'].includes(keyCode)) {
        // keyboard.keys.ArrowRight = false
        game.dirX = 0
      }
      if (['ArrowUp', 'ArrowDown'].includes(keyCode)) {
        game.dirY = 0
      }
    }
    const canvas = h(
      'canvas',
      {
        height: 512,
        width: 512,
        tabindex: 0,
        autofocus: true,
        onKeydown,
        onKeyUp
      }
    )
    const layers = [canvas]
    const map = reactive({
      cols: 10,
      rows: 10,
      tSize: 64,
      layers: [
        [
          2, 2, 2, 2, 1, 0, 0, 0, 0, 0,
          2, 2, 2, 2, 1, 1, 0, 0, 1, 0,
          2, 1, 2, 2, 2, 1, 1, 1, 0, 0,
          1, 1, 1, 2, 2, 1, 1, 1, 0, 0,
          0, 0, 1, 2, 2, 2, 1, 0, 0, 0,
          0, 0, 0, 2, 2, 1, 1, 1, 0, 0,
          0, 1, 1, 2, 2, 2, 1, 1, 1, 0,
          1, 1, 1, 2, 1, 2, 2, 2, 1, 0,
          0, 1, 1, 0, 2, 2, 2, 2, 2, 0,
          0, 0, 0, 0, 0, 2, 2, 2, 2, 2
        ],
        [
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          0, 0, 3, 3, 3, 3, 3, 3, 3, 3,
          0, 0, 0, 3, 3, 3, 0, 0, 3, 3,
          0, 0, 0, 0, 0, 3, 0, 0, 3, 3,
          0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 3, 3, 0, 0, 0, 3,
          3, 0, 0, 0, 3, 3, 3, 0, 0, 3,
          3, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          3, 0, 0, 0, 0, 0, 3, 3, 3, 3,
          3, 0, 0, 3, 3, 3, 3, 3, 3, 3
        ]
      ]
    })
    const camera = reactive({
      x: 0,
      y: 0,
      width: 512,
      height: 512,
      speed: 256
    })
    const keyboard = reactive({
      keys: {}
    })
    const game = reactive({
      dirX: 0,
      dirY: 0
    })
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
    keys.forEach(function (key) {
      keyboard.keys[key] = false
    })
    /* const getTile = computed(() => {
      return (layer, col, row) => map.layers[layer][row * map.cols + col]
    }) */
    function getTile (layer, col, row) {
      return map.layers[layer][row * map.cols + col]
    }
    /* import SimplexNoise from 'simplex-noise'
    const noise = new SimplexNoise('Hysdjdks')
    for (let r = 0; r <= map.rows; r++) {
      map.tiles[r] = []
      for (let c = 0; c <= map.rows; c++) {
        map.tiles[r][c] = Math.floor(Math.abs(noise.noise2D(r / 75, c / 75) * 2)) // map.rows * r / 512, map.cols * c / 512
      }
    } */
    let timestamp = performance.now()
    const draw = elapsed => {
      if (elapsed < (timestamp + 3)) return requestAnimationFrame(draw)
      const delta = Math.min((elapsed - timestamp) / 1000, 0.25)
      camera.x += game.dirX * camera.speed * delta
      camera.y += game.dirY * camera.speed * delta

      camera.x = Math.max(0, Math.min(camera.x, map.cols * map.tSize - camera.width))
      camera.y = Math.max(0, Math.min(camera.y, map.rows * map.tSize - camera.height))
      const ctx = canvas.el.getContext('2d')
      ctx.clearRect(0, 0, 512, 512)
      const startCol = Math.floor(camera.x / map.tSize)
      const endCol = startCol + (camera.width / map.tSize)
      const startRow = Math.floor(camera.y / map.tSize)
      const endRow = startRow + (camera.height / map.tSize)
      const offsetX = -camera.x + startCol * map.tSize
      const offsetY = -camera.y + startRow * map.tSize
      for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
          const tile = getTile(0, c, r)
          // map.tiles[r * map.cols + c]
          ctx.fillStyle = `hsl(${tile * 90}, 70%, 80%)`
          const x = (c - startCol) * map.tSize + offsetX
          const y = (r - startRow) * map.tSize + offsetY
          if (tile !== 0) {
            ctx.fillRect(x, y, map.tSize, map.tSize)
          }
        }
      }
      timestamp = elapsed
      requestAnimationFrame(draw)
    }
    // const tick = () => {
    // }
    onMounted(() => {
      requestAnimationFrame(draw)
    })
    /* const can = h(
      'canvas',
      {
        height: 512,
        width: 512,
        tabindex: 0,
        autofocus: true,
        onKeydown: keyDown,
        onKeyUp: keyUp
      }
    ) */
    return () => layers
    /* console.log(can)
    return {
      canvas,
      keyDown,
      keyUp,
      tick
    } */
  }
}
const fps = 60
const interval = 1000 / fps
const then = performance.now()
let frame = -1
let requestId
function loop (now) {
  const seg = Math.floor((now - then) / interval)
  if (seg > frame) {
    frame = seg
    // draw
  }
  requestId = requestAnimationFrame(loop)
}
