<!-- <template>
  <canvas
    ref="canvas"
    height="512"
    width="512"
    tabindex="0"
    autofocus
    @keydown="keyDown"
    @keyup="keyUp"
  />
</template> -->

<script>
import {
  h,
  onMounted,
  onUnmounted,
  ref,
  computed
} from 'vue'

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

/* class AnimationFrame {
  constructor (animate, fps = 60) {
    this.requestID = 0
    this.fps = fps
    this.animate = animate
  }

  start () {
    let then = performance.now()
    const interval = 1000 / this.fps

    const animateLoop = (now) => {
      this.requestID = requestAnimationFrame(animateLoop)
      const delta = now - then

      if (delta > interval) {
        then = now - (delta % interval)
        this.animate(delta)
      }
    }
    this.requestID = requestAnimationFrame(animateLoop)
  }

  stop () {
    cancelAnimationFrame(this.requestID)
  }
}

new AnimationFrame() */

const useGameTick = (view, fps = 60) => {
  let then = 0
  const requestId = ref(0)
  const isPlaying = ref(false)
  const interval = 1000 / fps
  const tolerance = 0.1
  const tick = now => {
    if (now - tolerance > then + interval) {
      then = now
      // fps =  Math.floor(1 / ((now + interval) % then) * 1000)
      view((now + interval) % then)
    }
    requestId.value = requestAnimationFrame(tick)
  }
  const start = () => {
    isPlaying.value = true
    requestId.value = requestAnimationFrame(tick)
  }
  const pause = () => {
    if (isPlaying.value) {
      cancelAnimationFrame(requestId.value)
      isPlaying.value = false
    }
  }
  const isPaused = computed(() => !isPlaying.value)
  return {
    start,
    pause,
    isPaused
  }
}

export default {
  name: 'App',
  components: {},
  setup () {
    const canvas = h('canvas', {
      height: 512,
      width: 512
    })
    const context = ref()
    const draw = (ctx, layer, offsetX, offsetY) => {
      ctx.clearRect(0, 0, 512, 512)
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 10) * 36}, 70%, 80%)`
      ctx.fillRect(0, 0, 20, 20)
      ctx.fillStyle = '#000'
      ctx.font = '16px Roboto'
    }
    const view = delta => {
      draw(context.value, 0, 0, 0)
    }
    const { start, pause } = useGameTick(view, 10)
    /* let then = 0
    const requestId = ref(0)
    const isPlaying = ref(false)
    const interval = 1000 / 10
    const tolerance = 0.1
    const tick = now => {
      if (now - tolerance > then + interval) {
        then = now
        // fps =  Math.floor(1 / ((now + interval) % then) * 1000)
        view()
      }
      requestId.value = requestAnimationFrame(tick)
    }
    const start = () => {
      isPlaying.value = true
      requestId.value = requestAnimationFrame(tick)
    }
    const pause = () => {
      if (isPlaying.value) {
        cancelAnimationFrame(requestId.value)
        isPlaying.value = false
      }
    } */
    onMounted(() => {
      context.value = canvas.el.getContext('2d')
      view()
      start()
    })
    onUnmounted(() => {
      pause()
    })
    return () => [
      canvas
      /* h('button', {
        onClick: start,
        style: {
          position: 'fixed',
          right: '120px'
        }
      }, 'Start'),
      h('button', { onClick: pause }, 'Stop') */
    ]
  }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
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
</style>
