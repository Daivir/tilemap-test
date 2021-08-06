<template>
  <div style="display:flex; align-items:flex-start">
    <canvas
      ref="canvas"
      height="512"
      width="512"
    />
    <canvas
      ref="canvas2"
      height="512"
      width="512"
    />
  </div>
</template>

<script>
/* eslint-disable no-unused-vars, camelcase */
import { onMounted, ref } from 'vue'
import SimplexNoise from 'simplex-noise'
import Map from '@/core/Map/index-test.js'

export default {
  name: 'App',
  setup () {
    const canvas = ref()
    const canvas2 = ref()
    const tileSize = 8
    const camera = { x: 0, y: 100 }
    const map = new Map('queue', [512, 512])
    map.init()
    /* const draw = (canvas, map) => {
      const { height: h, width: w } = canvas
      const ctx = canvas.getContext('2d')
      const rows = w / tileSize
      const cols = h / tileSize
      ctx.save()
      const offsetX = camera.x
      const offsetY = camera.y
      for (let c = offsetY; c < cols + offsetY; c++) {
        for (let r = offsetX; r < rows + offsetX; r++) {
          const tile = map.tilemap.get(r, c)
          const x = (r - offsetX) * tileSize
          const y = (c - offsetY) * tileSize
          ctx.strokeStyle = '#999'
          ctx.strokeRect(x, y, tileSize, tileSize)
          const colorMap = tile.water ? 'darkblue' : 'darkgreen'
          ctx.fillStyle = colorMap
          ctx.strokeStyle = colorMap
          ctx.fillRect(x, y, tileSize, tileSize)
          // elevation ------------------------
          // ctx.fillStyle = 'white'
          // ctx.textBaseline = 'middle'
          // ctx.textAlign = 'center'
          // const dist = (Math.floor((tile.distance || 0) * 25)).toString()
          // ctx.fillText(dist, x + (tileSize / 2), y + (tileSize / 2))
          // ----------------------------------
          ctx.fill()
          ctx.stroke()
        }
      }
      ctx.fill()
      ctx.restore()
    }
    const drawMap = (canvas, map) => {
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      for (let c = 0; c < map.h; c++) {
        for (let r = 0; r < map.w; r++) {
          const tile = map.tilemap.get(r, c)
          const x = r
          const y = c
          ctx.fillStyle = tile.water ? '#0077be' : '#228b22'
          // ------------
          // ctx.fillStyle = tile.water ? '#455262'
          //   : `hsl(${tile.distance * 36}, 80%, 70%)`
          ctx.fillStyle = tile.water
            ? `hsl(${25 * Math.floor(tile.distance * 4) / 4 * 3.6 + 240}, 50%, 50%)`
            : `hsl(${3.6 * 25 * Math.floor(tile.distance * 4) / 4 + 60}, 70%, 50%)`
          tile.getNeighborIds(map.tilemap).forEach((nId) => {
            const neighbor = map.tilemap.find(nId)
            const a = Math.floor(tile.distance * 4) / 4
            const b = Math.floor(neighbor.distance * 4) / 4
            if (a > b) {
              // ctx.fillStyle = 'black'
            }
          })
          ctx.fillStyle = tile.ocean ? `hsl(${25 * Math.floor(tile.distance * 4) / 4 * 3.6 + 280}, 50%, 50%)` : ''
          // ctx.fillStyle = tile.coast ? 'black' : ''
          // ------------
          ctx.fillRect(x, y, 1, 1)
          ctx.fill()
          ctx.stroke()
        }
      }
      ctx.strokeStyle = 'yellow'
      ctx.strokeRect(
        camera.x,
        camera.y,
        512 / tileSize,
        512 / tileSize
      )
      ctx.stroke()
    }
    const map = new Map('hcqk1t6h51sdc')
    map.create(SimplexNoise) */
    const draw = () => {
      const colorMap = tile => {
        if (tile.water) { return '#045aa0' }
        return 'darkred'
      }
      const ctx = canvas.value.getContext('2d')
      const { height: h, width: w } = ctx.canvas
      // const rows = w / tileSize
      // const cols = h / tileSize
      const offsetX = camera.x
      const offsetY = camera.y
      const row = { start: offsetX, end: offsetX + (w / tileSize) }
      const col = { start: offsetY, end: offsetY + (h / tileSize) }
      const id = ({ x, y }) => x + map.w * y
      const c = map.grid.getAll().slice(
        id({ x: row.start, y: col.start }),
        id({ x: row.end, y: col.end })
      )
      for (const tile of c) {
        const { x, y } = tile.site
        const r = (x - offsetX) * tileSize
        const c = (y - offsetY) * tileSize
        ctx.fillStyle = colorMap(tile)
        ctx.fillRect(r, c, tileSize, tileSize)
        ctx.fill()
      }
    }
    const drawMap = (canvas) => {
      const colorMap = tile => {
        if (tile.water) { return '#045aa0' }
        return 'darkred'
      }
      const ctx = canvas.value.getContext('2d')
      for (const tile of map.grid.getAll()) {
        const { x, y } = tile.site
        ctx.fillStyle = colorMap(tile)
        ctx.fillRect(x, y, tileSize, tileSize)
        ctx.fill()
      }
      ctx.strokeStyle = 'yellow'
      ctx.strokeRect(
        camera.x,
        camera.y,
        map.w / tileSize,
        map.h / tileSize
      )
      ctx.stroke()
    }
    onMounted(() => {
      /* deltas => {
        let execTime = deltas.reduce((acc, curr) => acc + curr)
        execTime = Math.floor(execTime / 1000 * 100) / 100
        console.log(`${execTime.toString().padEnd(4, '0')}s`)
      } */
      draw(canvas)
      drawMap(canvas2)
    })
    return { canvas, canvas2 }
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
