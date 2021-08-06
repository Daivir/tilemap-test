/* eslint-disable no-unused-vars, camelcase */
import SimplexNoise from 'simplex-noise'
import Alea from 'alea'

// TODO: ASTAR (A*) ALGORITHM

/**
 * Fractal Brownian Motion Noise
 * @param generator {SimplexNoise} Noise generator (Simplex, Perlin...)
 * @param amplitudes {number[]}
 * @param nx {number}
 * @param ny {number}
 * @returns number
 */
const fbmNoise = (
  generator,
  amplitudes,
  nx,
  ny
) => {
  let sum = 0
  let sumOfAmplitudes = 0
  for (let octave = 0; octave < amplitudes.length; octave++) {
    const frequency = 1 << octave
    sum += amplitudes[octave] * generator.noise3D(nx * frequency, ny * frequency, octave)
    sumOfAmplitudes += amplitudes[octave]
  }
  return sum / sumOfAmplitudes
}

/**
 * Von Neumann Neighborhood Algorithm - 4x-connected
 * @param range {number}
 * @param dimensions {number}
 * @return number[][]
 */
const vonNeumann = (
  range,
  dimensions
) => {
  range = range || 1
  dimensions = dimensions || 2
  const size = range * 2 + 1
  const iterations = Math.pow(size, dimensions)
  const center = (iterations - 1) / 2
  const neighbors = []
  for (let i = 0; i < iterations; i++) {
    if (i !== center) {
      const neighbor = new Array(dimensions)
      let distance = 0
      let remaining = i
      for (let d = 0; d < dimensions; d++) {
        const remainder = remaining % Math.pow(size, d + 1)
        const value = remainder / Math.pow(size, d) - range
        neighbor[d] = value
        distance += Math.abs(value)
        remaining -= remainder
      }
      if (distance <= range) {
        neighbors.push(neighbor)
      }
    }
  }

  return neighbors
}

/**
 * Moore Neighborhood Algorithm - 8x-connected
 * @param range {number}
 * @param dimensions {number}
 * @return number[][]
 */
const moore = (
  range,
  dimensions
) => {
  range = range || 1
  dimensions = dimensions || 2
  const size = range * 2 + 1
  const length = Math.pow(size, dimensions) - 1
  const neighbors = new Array(length)
  for (let i = 0; i < length; i++) {
    const neighbor = neighbors[i] = new Array(dimensions)
    let index = i < length / 2 ? i : i + 1
    for (let dimension = 1; dimension <= dimensions; dimension++) {
      const value = index % Math.pow(size, dimension)
      neighbor[dimension - 1] = value / Math.pow(size, dimension - 1) - range
      index -= value
    }
  }
  return neighbors
}

/**
 * @callback PrngFunction { Alea | Math.random }
 * @return number
 */

/**
 * Fisher-Yates Shuffle Algorithm
 * @param arr {any[]}
 * @param prng {PrngFunction}
 * @return any[]
 */
const shuffle = (
  arr = [],
  prng = Math.random
) => {
  for (let i = 0; i < arr.length; i++) {
    const rdm = prng() * i | 0
    const tmp = arr[i]
    arr[i] = arr[rdm]
    arr[rdm] = tmp
  }
  return arr
}

// =========================================================

const neighborhood = vonNeumann(1, 2)

function TileSet (size) {
  const [h, w] = size
  const nodes = []
  const grid = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      nodes.push({ x, y })
    }
  }
  this.create = (val = ({ x, y }) => 0) => {
    for (let i = 0; i < nodes.length; i++) {
      grid.push(val(nodes[i]))
    }
  }
}

/**
 * @param seed {string}
 * @param {[h: number, w: number]} size
 * @constructor
 */
function Map (seed, size) {
  const grid = new TileSet(size)
  const alea = new Alea(seed)
  const prng1 = alea()
  const prng2 = alea()
  const getNoiseValue = ({ x, y }, {
    seed = Math.random(),
    jitter = 0.5,
    amplitudes = [1 / 2, 1 / 4, 1 / 8, 1 / 16],
    aspect = 4
  } = {}) => {
    const nx = x / this.w - jitter
    const ny = y / this.h - jitter
    return fbmNoise(
      new SimplexNoise(seed.toString()),
      amplitudes,
      nx * aspect,
      ny * aspect
    )
  }
  this.init = () => {
    grid.create(node => {
      const n1 = getNoiseValue(node, { seed: prng1 })
      const n2 = getNoiseValue(node, { seed: prng2 })
      const water = n1 < 0 - 0.05 || Math.abs(n2) < 0.05
      return { node, water }
    })
    console.table(grid)
  }
}

export default Map
