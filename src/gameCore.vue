<template>
  <div
    class="container"
  >
    <canvas
      v-for="n in 3"
      :key="n"
      :ref="el => { if (el) canvas[n] = el }"
      v-bind="{ height, width }"
      :style="{
        height: '100%',
        width: '100%',
        position: 'absolute',
        inset: 0
      }"
    />
    <div
      style="position: absolute;z-index:1;inset:0"
    >
      <div style="position:absolute;bottom:16px;left:16px;">
        <input
          type="button"
          value="Start"
          @click="start({ fpsRate })"
        >
        <input
          type="button"
          value="Pause"
          @click="pause"
        >
        <label>
          <span style="color:white">Fps</span>
          <input
            v-model="fpsRate"
            type="text"
          >
        </label>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import {
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
  reactive,
  nextTick,
  computed
} from 'vue'

import worldMap from './simplex'

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

const useEvent = (
  el,
  type,
  listener
) => {
  onMounted(() => el && el.addEventListener(type, listener))
  const remove = () => el && el.removeEventListener(type, listener)
  onUnmounted(remove)
  return remove
}

const useResizeEvent = (
  wait = 0
) => {
  const height = ref(window.innerHeight)
  const width = ref(window.innerWidth)
  const handler = () => {
    height.value = window.innerHeight
    width.value = window.innerWidth
  }
  const remove = useEvent(window, 'resize', debounce(handler, wait))
  onMounted(handler)
  return { height, width, remove }
}

const useGameLoop = (
  update
) => {
  const state = {
    requestId: 0,
    isRunning: false,
    then: 0,
    fpsRate: null
  }
  const frame = now => {
    const tolerance = 0.1
    const interval = 1000 / state.fpsRate
    if (now - tolerance > state.then + interval) {
      state.then = now
      update((now + interval) % state.then)
    }
    state.requestId = requestAnimationFrame(frame)
  }
  const start = ({
    fpsRate = 60
  } = {}) => {
    state.fpsRate = fpsRate
    state.isRunning = true
    state.requestId = requestAnimationFrame(frame)
  }
  const pause = () => {
    if (state.isRunning) {
      cancelAnimationFrame(state.requestId)
      state.isRunning = false
    }
  }
  return { start, pause }
}

class Entity {
  SPEED = 4 * 64
  constructor (
    { x = 0, y = 0 }
  ) {
    this.x = x
    this.y = y
  }

  move (delta, dirX, dirY) {
    this.x += dirX * this.SPEED * delta
    this.y += dirY * this.SPEED * delta
  }
}

const Keyboard = () => {
  const LEFT = 'ArrowLeft'
  const RIGHT = 'ArrowRight'
  const UP = 'ArrowUp'
  const DOWN = 'ArrowDown'
  const keyList = {}
  const listenForEvents = () => {
    const keys = [LEFT, RIGHT, UP, DOWN]
    useEvent(window, 'keyup', onKeyup)
    useEvent(window, 'keydown', onKeydown)
    keys.forEach(key => {
      keyList[key] = false
    })
  }
  const onKeydown = e => {
    console.log('onkeydown')
    const keyCode = e.key
    if (keyCode in keyList) {
      e.preventDefault()
      keyList[keyCode] = true
    }
  }
  const onKeyup = e => {
    console.log('onkeyup')
    const keyCode = e.key
    if (keyCode in keyList) {
      e.preventDefault()
      keyList[keyCode] = false
    }
  }
  const isDown = keyCode => {
    if (!(keyCode in keyList)) {
      throw new Error(`${keyCode} is not being listened to`)
    }
    return keyList[keyCode]
  }
  return {
    listenForEvents,
    onKeydown,
    onKeyup,
    isDown,
    LEFT,
    RIGHT,
    UP,
    DOWN
  }
}

export default {
  name: 'App',
  setup () {
    const canvas = ref([])
    const keyboard = Keyboard()
    const entity = new Entity({ x: 0, y: 0 })
    const map = {
      tSize: 8
    }
    keyboard.listenForEvents()
    const state = reactive({
      fpsRate: 10
    })
    const { height, width } = useResizeEvent(50)
    /* watchEffect(() => {
    console.log(container.value[1])
  },
  { flush: 'post' }) */
    const update = deltaT => {
      let dirX = 0
      let dirY = 0
      const delta = Math.min((deltaT / 1000), 0.25)
      if (keyboard.isDown(keyboard.LEFT)) { dirX = -1 }
      if (keyboard.isDown(keyboard.RIGHT)) { dirX = 1 }
      if (keyboard.isDown(keyboard.UP)) { dirY = -1 }
      if (keyboard.isDown(keyboard.DOWN)) { dirY = 1 }
      entity.move(delta, dirX, dirY)
      const currCanvas = canvas.value[1]
      const ctx = currCanvas.getContext('2d')
      ctx.clearRect(0, 0, currCanvas.width, currCanvas.height)
      /* const height = 64
  const width = 64
  for (let c = 0; c <= height; c++) {
    for (let r = 0; r <= width; r++) {
      const x = (c - (entity.x / map.tSize)) * map.tSize
      const y = (r - (entity.y / map.tSize)) * map.tSize
      // row = r * width
      // col = c * height
      ctx.fillStyle = `hsl(${(360 * Math.round(worldMap[c * width + r] * 3) / 3)}, 70%, 80%)`
      ctx.fillRect(x, y, map.tSize, map.tSize)
    }
  } */
      /*
  0  1  2  3  4
  5  6  7  8  9
  10 11 12 13 14
  15 16 17 18 19
  col = c * width
  row = r
  */
      ctx.beginPath()
      ctx.fillStyle = 'red'
      ctx.fillRect(currCanvas.width / 2, currCanvas.height / 2, map.tSize, map.tSize)
      ctx.fill()
    }
    const { start, pause } = useGameLoop(update)
    onMounted(() => {
      start({ fpsRate: state.fpsRate })
    })
    onUnmounted(() => {
    })
    return {
      canvas,
      height,
      width,
      pause,
      start,
      fpsRate: state.fpsRate
    }
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
