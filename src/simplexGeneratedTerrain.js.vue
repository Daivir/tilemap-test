<template>
  <canvas
    ref="canvas"
    height="512"
    width="512"
  />
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
import SimplexNoise from 'simplex-noise'

function Terrain (w, h) {
  this.w = w
  this.h = h
  this.size = w * h
  this.data = new Float32Array(this.size)
  this.id = (x, y) => x + this.w * y
  this.x = id => id % this.w
  this.y = id => (id / this.w) | 0
  this.get = (x, y) => this.data[this.id(x, y)]
  this.set = (x, y, val) => (this.data[this.id(x, y)] = val)
}

/* function fillNoise (output, seed, { frequency, amplitudes }) {
  const { h, w } = output
  const JITTER = 0.5
  const simplex = new SimplexNoise(seed)
  const aspect = w / h
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w - JITTER
      const ny = y / h - JITTER
      let z = simplex.noise2D(nx * frequency * aspect, ny * frequency)
      for (let i = 0; i < amplitudes.length; i++) {
        z += amplitudes[i] * z
      }
      output.set(x, y, { x, y, z: z / 2 + 0.5 })
    }
  }
} */

/* function fillNoise (output, seed) {
  const { h, w } = output
  const JITTER = 0.5
  const aspect = w / h * 7
  const numlevels = 4
  const exponent = 6
  const simplex = new SimplexNoise(seed)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let z = 0
      let scale = 0
      const nx = x / w - JITTER
      const ny = y / h - JITTER
      for (let octave = 0, frequency = 1; octave < numlevels; octave++, frequency *= 2) {
        let amplitude = 1 / frequency
        if (octave > 0) amplitude *= z
        scale += amplitude
        z += amplitude * (1 - Math.abs(simplex.noise3D(nx * aspect * frequency, ny * aspect * frequency, octave)))
      }
      z = 0.2 + Math.pow(z / scale * 1.2, exponent)
      output.set(x, y, { x, y, z })
    }
  }
} */

function generateMap (output, seed) {
  const { h, w } = output
  const JITTER = 0.5
  const aspect = w / h * 4
  const simplex = new SimplexNoise(seed)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w - JITTER
      const ny = y / h - JITTER
      const e = simplex.noise2D(nx * aspect, ny * aspect) +
        (1 / 2) * simplex.noise2D(nx * aspect * 2, ny * aspect * 2) +
        (1 / 4) * simplex.noise2D(nx * aspect * 4, ny * aspect * 4) +
        (1 / 8) * simplex.noise2D(nx * aspect * 8, ny * aspect * 8) +
        (1 / 16) * simplex.noise2D(nx * aspect * 16, ny * aspect * 16)
      let z = (1 - Math.abs(e))
      z = Math.pow(z, 3) + 0.2
      output.set(x, y, z)
    }
  }
}

function biome (e, m) {
  const OCEAN = '#008ab7'
  const BEACH = '#eccca2'
  const FOREST = '#387532'
  const TUNDRA = '#dde7f2'
  const SNOW = '#ecfffd'
  const GRASSLAND = '#8b8d34'
  const TEMPERATE_RAIN_FOREST = '#657d23'

  if (e < 0.05) return OCEAN
  if (e < 0.11) return BEACH

  if (e > 0.8) {
    if (m < 0.2) return FOREST
    if (m < 0.5) return TUNDRA
    return SNOW
  }
  if (e > 0.3) {
    if (m < 0.50) return GRASSLAND
  }
  if (m < 0.33) return GRASSLAND
  return TEMPERATE_RAIN_FOREST
}

/* function addMaps (output, maps, amplitudes) {
  const maxLen = maps.length;
  if (maxLen !== amplitudes.length) {
    throw new Error('maps and amplitudes must be same length')
  }
  for (let y = 0; y < output.h; y++) {
    for (let x = 0; x < output.w; x++) {
      let z = 0
      for (let i = 0; i < maxLen; i++) {
        z += amplitudes[i] * maps[i].get(x, y)
      }
      output.set(x, y, z)
    }
  }
}

function mixNoise (output, spectrum, frequency, seed) {
  let scale = 0.0
  const maps = []
  const amplitudes = []
  for (let octave = 0, exponent = 1; octave < spectrum.length; octave++, exponent *= 2) {
    scale += spectrum[octave]
    maps.push(makeNoise(output.w, output.h, frequency * exponent, seed + octave))
    amplitudes.push(spectrum[octave])
  }
  addMaps(output, maps, amplitudes.map(function(a) { return a/scale; }))
} */

export default {
  name: 'App',
  setup () {
    const canvas = ref()

    const width = 256
    const height = 256
    const tSize = 2

    const elevation = new Terrain(width, height)
    const moisture = new Terrain(width, height)
    generateMap(elevation, 'seed')
    generateMap(moisture, 'seed2')
    function drawTerrain (canvas, elevation) {
      const ctx = canvas.getContext('2d')
      ctx.save()
      for (let c = 0; c < elevation.h; c++) {
        for (let r = 0; r < elevation.w; r++) {
          ctx.beginPath()
          let z = elevation.get(r, c)
          let m = moisture.get(r, c)
          z = z * 1.4 - 0.35
          m = m * 3.0 - 1.0
          ctx.fillStyle = biome(z, m)
          ctx.fillRect((r - (0 / tSize)) * tSize, (c - (0 / tSize)) * tSize, tSize, tSize)
          ctx.fill()
        }
      }
      /* for (let { x, y, z } of elevation.data) {
        ctx.beginPath()
        let m = moisture.get(x, y).z
        z = z * 1.4 - 0.35
        m = m * 3.0 - 1.0
        ctx.fillStyle = biome(z, m)
        ctx.fillRect((x - (0 / tSize)) * tSize, (y - (0 / tSize)) * tSize, tSize, tSize)
        ctx.fill()
      } */
      ctx.restore()
    }
    onMounted(() => {
      drawTerrain(canvas.value, elevation)
    })
    return {
      canvas
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
