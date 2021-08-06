/* eslint-disable no-unused-vars, camelcase */
import SimplexNoise from 'simplex-noise'
import TileMap from './TileMap'
import Tile from './Tile'

/**
 * @param generator {SimplexNoise} Noise generator (Simplex, Perlin...)
 * @param amplitudes {number[]}
 * @param nx {number}
 * @param ny {number}
 * @returns {number}
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
 * @param seed {string | number}
 * @constructor
 */
function Map (seed) {
  /** @type {number} */
  const ASPECT = 4
  /** @type {number} */
  const JITTER = 0.5
  /** @type {number} */
  this.h = 256
  /** @type {number} */
  this.w = 256
  /** @type {TileMap} */
  this.tilemap = new TileMap(this.w, this.h)

  /**
   * @param NoiseGenerator
   * @param amplitudes {number[]}
   * @returns void
   */
  this.create = (NoiseGenerator = SimplexNoise, {
    amplitudes = [1, 1 / 2, 1 / 4, 1 / 8]
  } = {}) => {
    const noise = new NoiseGenerator(seed)
    function Site (x, y) {
      return { x, y }
    }
    for (let y = 0; y < this.h; y++) { // cols
      for (let x = 0; x < this.w; x++) { // rows
        const nx = x / this.w - JITTER
        const ny = y / this.h - JITTER
        const z = fbmNoise(noise, amplitudes, nx * ASPECT, ny * ASPECT)
        const tile = new Tile(Site(x, y))
        tile.water = z < 0
        this.tilemap.set(x, y, tile)
      }
    }
    /**
     * Ocean:
     * Recupère les tiles en bordure = quand un seul ou plusieur tile voisin n'existe pas
     * Loop les tiles en bordure en cherchant si les voisins sont de l'eau sinon on passe au suivant
     */
    const stack = []
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const tile = this.tilemap.get(x, y)
        tile.getNeighborIds(this.tilemap).forEach(nId => {
          const neihbor = this.tilemap.find(nId)
          if (neihbor.border) {
            stack.push(tile)
          }
        })
      }
    }
    while (stack.length > 0) {
      const tile = stack.pop()
      const neighbors = tile.getNeighborIds(this.tilemap)
      neighbors.forEach(nId => {
        const neighbor = this.tilemap.find(nId)
        if (neighbor.water && !neighbor.ocean) {
          neighbor.ocean = true
          stack.push(neighbor)
        }
      })
    }
    // coasts
    const coasts = []
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const tile = this.tilemap.get(x, y)
        const neighbors = tile.getNeighborIds(this.tilemap)
        neighbors.forEach(nId => {
          const neighbor = this.tilemap.data[nId]
          if (tile.ocean && !neighbor.ocean) {
            neighbor.coast = true
            neighbor.distance = 0
            coasts.push(neighbor)
          }
        })
      }
    }
    // elevation
    let minDistance = 1
    let maxDistance = 1
    while (coasts.length > 0) {
      /** @type Tile */
      const tile = coasts.shift()
      const neighbors = tile.getNeighborIds(this.tilemap)
      neighbors.forEach(nId => {
        const neighbor = this.tilemap.find(nId)
        const newDistance = 1 + tile.distance
        if (neighbor.distance == null || newDistance < neighbor.distance) {
          neighbor.distance = newDistance
          if (neighbor.water && newDistance > minDistance) { minDistance = newDistance }
          if (!neighbor.water && newDistance > maxDistance) { maxDistance = newDistance }
          coasts.push(neighbor)
        }
      })
    }
    this.tilemap.all().forEach(tile => {
      tile.distance = tile.water
        ? -tile.distance / minDistance
        : tile.distance / maxDistance
    })
    // redistribute elevation of lands
    const SCALE_FACTOR = 1.1
    const land = this.tilemap.all().filter(tile => !tile.water)
    land.sort((t1, t2) => t1.distance - t2.distance)
    land.forEach((t, i) => {
      const y = i / (land.length - 1)
      let x = Math.sqrt(SCALE_FACTOR) - Math.sqrt(SCALE_FACTOR * (1 - y))
      if (x > 1.0) x = 1.0
      const tile = this.tilemap.find(t.id)
      tile.distance = x
    })
    /* Promise.all([
      new Promise((resolve, reject) => {
        const then = performance.now()
        generate()
        resolve(performance.now() - then)
      })
    ]).then(cb) */
  }
}

export default Map
