/* <canvas
  ref="canvas"
  height="512"
  width="512"
  tabindex="0"
  autofocus
    @keydown="keyDown"
@keyup="keyUp"
/> */

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
export function animationInterval (ms, signal, callback) {
  // Prefer currentTime, as it'll better sync animtions queued in the
  // same frame, but if it isn't supported, performance.now() is fine.
  const then = performance.now()

  function frame (time) {
    if (signal.aborted) return
    callback(time)
    scheduleFrame(time)
  }

  function scheduleFrame (now) {
    // const elapsed = now - then
    // const roundedElapsed = Math.round(elapsed / ms) * ms
    // const targetNext = then + roundedElapsed + ms
    // const delay = targetNext - performance.now()
    // then + now - then
    const delay = now + ms % performance.now()
    setTimeout(() => requestAnimationFrame(frame), delay)
  }

  scheduleFrame(then)
}

const useAnimationFrame = (ms, callback) => {
  const callbackRef = ref(callback)
  useEffect(() => {
    callbackRef.value = callback
  }, [callback])

  useEffect(() => {
    const controller = new AbortController()
    animationInterval(ms, controller.signal, callbackRef.value)
    return () => controller.abort()
  }, [ms])
}

// usage
useAnimationFrame(1000, () => setVisible(x => !x))




const frame = now => {
  if (now - tolerance > state.then + interval) {
    state.then = now
    update((now + interval) % state.then)
  }
  state.requestId = requestAnimationFrame(frame)
}


// ---------------------

const frame = now => {
  state.then = now
  const delta = (now + interval) % state.then
  update(delta)
  setTimeout(() => {
    state.requestId = requestAnimationFrame(frame)
  }, delta)
}


let then = performance.now()
const interval = 1000 / 60
const animateLoop = (now) => {
  this.requestID = requestAnimationFrame(animateLoop)
  const delta = now - then

  if (delta > interval) {
    then = now - (delta % interval)
    this.animate(delta)
  }
}

const useGameLoop = (update, { fpsRate = 60 }) => {
  const interval = 1000 / fpsRate
  // const tolerance = 0.1
  const state = reactive({
    then: 0,
    requestId: 0,
    isPlaying: false,
    interval
  })
  const frame = now => {
    if (now > state.then + interval) {
      state.then = now
      update((now + interval) % state.then)
    }
    state.requestId = requestAnimationFrame(frame)
  }
  const start = () => {
    state.isPlaying = true
    state.requestId = requestAnimationFrame(frame)
  }
  const pause = () => {
    if (state.isPlaying) {
      cancelAnimationFrame(state.requestId)
      state.isPlaying = false
    }
  }
  return {
    start,
    pause,
    started: computed({
      get: () => state.isPlaying
    })
  }
}

export default {
  name: 'App',
  components: {},
  setup () {
    const canvas = h('canvas', {
      height: 512,
      width: 512,
      style: { position: 'absolute' }
    }, 'Canvas not supported')
    const map = reactive({
      layers: [[], []]
    })
    let myWorker = null
    if (window.Worker) {
      myWorker = new Worker('./offscreencanvas.js')
    }
    const dom = []
    map.layers.forEach(() => dom.push(canvas))
    const drawLayer = (layer, offsetX, offsetY) => {
      const ctx = dom[layer].el.getContext('2d')
      clearView(ctx)
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 10) * 36}, 70%, 80%)`
      ctx.fillRect(layer * 10, 0, 20, 20)
      ctx.fillStyle = '#000'
      ctx.font = '16px Roboto'
    }
    const clearView = ctx => {
      ctx.clearRect(0, 0, canvas.el.width, canvas.el.height)
    }
    const drawMap = () => {
      map.layers.forEach((_, i) => {
        drawLayer(i, 0, 0)
      })
    }
    const render = () => {
      drawMap()
    }
    const update = delta => {
      // Math.min(1 / delta * 1000, interval)
      render()
    }
    const init = () => {
      render()
    }
    const { start, pause, started } = useGameLoop(update, {
      fpsRate: 1
    })
    onMounted(() => {
      const load = new Promise(resolve => resolve(true))
      Promise.all([load]).then(function (loaded) {
        init()
        start()
        setTimeout(() => {
          pause()
        }, 2000)
        console.log(started.value)
      })
    })
    onUnmounted(() => {
      pause()
    })
    return () => dom
    /* h('button', {
      onClick: start,
      style: {
        position: 'fixed',
        right: '120px'
      }
    }, 'Start'),
    h('button', { onClick: pause }, 'Stop') */
  }
}

/* const useMap = (layers) => {
  const tileSize = 64
  const colCount = 10
  const rowCount = 10
  const rect = reactive({
    height: colCount * tileSize,
    width: rowCount * tileSize
  })
  function tileAt (layerId, col, row) {
    return layers[layerId][row * colCount + col]
  }
  /!* const tileAt = computed(() => {
    return (layerId, col, row) => layers[layerId][row * colCount + col]
  }) *!/
  return {
    rect,
    tileAt
  }
}

const useCamera = (map, settings) => {
  const SPEED = 256
  const position = reactive({
    x: 0,
    y: 0
  })
  const rect = reactive({
    width: 0,
    height: 0
  })
  const move = (deltaTime, deltaX, deltaY) => {
    const maxX = map.rect.width - rect.width
    const maxY = map.rect.height - rect.height

    position.x += deltaX * SPEED * deltaTime
    position.y += deltaY * SPEED * deltaTime

    // prevent looking beyond the map
    position.x = Math.max(0, Math.min(position.x, maxX))
    position.y = Math.max(0, Math.min(position.y, maxY))
  }
  return {
    move,
    position,
    rect
  }
}

const useGame = () => {
  const layers = { length: 1 }
  const context = ref()
  this.layerCanvas = Array.from(layers).map(function () {
    return h('canvas', {
      height: 512,
      width: 512
    })
  })
  const draw = () => {}
  const fps = 60
  const fpsInterval = 1000 / fps
  let tref = ref()
  let frame = -1
  let timestamp = performance.now()
  const tick = elapsed => {
    if (timestamp === null) timestamp = elapsed
    const seg = Math.floor((elapsed - timestamp) / fpsInterval)
    if (seg > frame) {
      frame = seg
      draw()
    }
    tref = requestAnimationFrame(tick)
  }
  function start () {
    requestAnimationFrame(tick)
  }
  onMounted(() => {
    requestAnimationFrame(tick)
    // context.value = this.layerCanvas[layer].getContext('2d')
  })
  return {
  }
} */
