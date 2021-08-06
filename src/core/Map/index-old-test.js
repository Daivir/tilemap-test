import { onMounted, ref } from 'vue'

/**
 * @template {Object} Entity
 * @param object {Object}
 * @param instance {Entity}
 * @return Entity
 */
const hydrate = (
  object,
  instance
) => {
  for (const [key, value] of Object.entries(object)) {
    instance[key] = value
  }
  return instance
}

function Site () {
  /** @type number */
  this.x = undefined
  /** @type number */
  this.y = undefined
}

const entities = {
  Site: function Site () {
    this.x = undefined
    this.y = undefined
  },
  Tile: function Tile () {
    this.id = undefined
    this.site = undefined
    this.water = false
    this.border = false
    this.ocean = false
    this.river = false
    this.distance = null
    this.getNeighborIds = (
      vn = vonNeumann(1, 2)
    ) => {}
  }
}

function Collection (entity, { idAttr = 'id' } = {}) {
  const list = []
  const items = []
  this.entity = entity
  if (typeof this.entity === 'undefined') {
    throw new Error('undefined entity')
  }
  const get = i => hydrate(items[i], new entities[this.entity]())
  this.insert = (id, data) => {
    data[idAttr] = id
    items[id] = data
    list.push(id) // data.id = (state.length - 1) | 0
  }
  this.read = () => list.map(id => get(id))
}

function TileSet (h, w) {
  const entity = 'Tile'
  Collection.call(this, entity)
  this.h = h
  this.w = w
}

TileSet.prototype = Object.create(Collection.prototype, {
  constructor: { value: TileSet }
})

const map = {
  w: 512,
  h: 512
}

const grid = []

const sites = new Array(map.w * map.h)
for (let i = 0; i < sites.length; i++) {
  sites[i] = hydrate({
    x: i % map.w,
    y: i / map.w | 0
  }, new Site())
}

let tilemap = []
for (let i = 0; i < sites.length; i++) {
  const site = sites[i]
  grid.insert(i, { site })
  /* const tile = {
    id: i,
    site: i,
    water: false,
    border: false,
    ocean: false,
    river: false,
    distance: null,
    getNeighborIds: (vn = vonNeumann(1, 2)) => {
      const neighborIds = []
      vn.forEach(([dx, dy]) => {
        const nx = site.x + dx
        const ny = site.y + dy
        const nId = nx + w * ny
        const neighbor = tilemap[nId]
        if (neighbor) {
          if (nx >= 0 && nx < w) {
            neighborIds.push(nId)
          }
        }
      })
      return neighborIds
    }
  }
  tile.site = site
  tilemap.push(tile) */
}
tilemap = grid.read()

  /* const h = 128
const w = 128
const tilemap = new Array(w * h)
const vn = vonNeumann(1, 2)
for (let i = 0; i < tilemap.length; i++) {
  const x = i % w
  const y = i / w | 0
  tilemap[i] = {
    id: i,
    x,
    y,
    water: false,
    border: false,
    ocean: false,
    river: false,
    distance: null,
    edges: vn.map(([dx, dy]) => {
      if (x + dx >= 0 && x + dx < w) {
        return {
          x: x + dx,
          y: y + dy
        }
      }
      return null
    }),
    getNeighborIds: (range = 1) => {
      const neighborIds = []
      vn.forEach(([dx, dy]) => {
        const nx = x + dx
        const ny = y + dy
        const nId = nx + w * ny
        const neighbor = tilemap[nId]
        if (neighbor) {
          if (nx >= 0 && nx < w) {
            neighborIds.push(nId)
          }
        }
      })
      return neighborIds
    }
  }
} */

// water && border
const seed = 'abcdefg'
const alea = new Alea(seed)
const amplitudes = [1 / 2, 1 / 4, 1 / 8, 1 / 16]
const ASPECT = 4

const borders = []
for (const tile of tilemap) {
  const { site } = tile
  const nx = site.x / grid.w
  const ny = site.y / grid.h
  const z = fbmNoise(new SimplexNoise(seed), amplitudes, nx * ASPECT, ny * ASPECT)
  const m = fbmNoise(new SimplexNoise('ifCp7rgo'), amplitudes, nx * 2, ny * 2)
  tile.water = z < 0 || (Math.abs(m) < 0.03 && Math.abs(m) > 0)
  if (tile.getNeighborIds().length < 4) {
    tile.border = true
    borders.push(tile)
  }
}

// ocean
while (borders.length > 0) {
  const tile = borders.pop()
  const neighbors = tile.getNeighborIds()
  neighbors.forEach(nId => {
    const neighbor = tilemap[nId]
    if (neighbor.water && !neighbor.ocean) {
      neighbor.ocean = true
      borders.push(neighbor)
    }
  })
}

// coasts and init distance
const coasts = []
for (const tile of tilemap) {
  const neighbors = tile.getNeighborIds()
  neighbors.forEach(nId => {
    const neighbor = tilemap[nId]
    if (tile.ocean && !neighbor.ocean) {
      neighbor.coast = true
      neighbor.distance = 0
      coasts.push(neighbor)
    }
  })
}

// ajouter une variation de tile.distance avec
// fbmnoise en prennant en compte les neighbor.distance des voisins

let minDistance = 1
let maxDistance = 1
const mooreA = moore(1, 2)
while (coasts.length > 0) {
  const tile = coasts.shift()
  for (const nId of tile.getNeighborIds()) {
    const neighbor = tilemap[nId]
    const lake = neighbor.water && !neighbor.ocean
    const newDistance = lake ? 0 : 1 + tile.distance
    if (neighbor.distance == null || newDistance < neighbor.distance) {
      neighbor.distance = newDistance
      if (neighbor.water && newDistance > minDistance) { minDistance = newDistance }
      if (!neighbor.water && newDistance > maxDistance) { maxDistance = newDistance }
      if (neighbor.water && !neighbor.ocean) {
        coasts.unshift(neighbor)
      } else {
        coasts.push(neighbor)
      }
    }
  }
}

/* let minDistance = 1
let maxDistance = 1
while (coasts.length > 0) {
  const tile = coasts.shift()
  for (const nId of tile.getNeighborIds()) {
    const neighbor = tilemap[nId]
    const lake = neighbor.water && !neighbor.ocean
    const newDistance = lake ? 0 : 1 + tile.distance
    if (neighbor.distance == null || newDistance < neighbor.distance) {
      neighbor.distance = newDistance
      if (neighbor.water && newDistance > minDistance) { minDistance = newDistance }
      if (!neighbor.water && newDistance > maxDistance) { maxDistance = newDistance }
      if (lake) {
        coasts.unshift(neighbor)
      } else {
        coasts.push(neighbor)
      }
    }
  }
} */

for (const tile of tilemap) {
  tile.distance = tile.water
    ? -tile.distance / minDistance
    : tile.distance / maxDistance
}

for (const tile of tilemap) {
  const nx = tile.site.x / grid.w
  const ny = tile.site.y / grid.h
  const z = fbmNoise(
    new SimplexNoise('ifCp7rgo'),
    [1 / 2, 1 / 4, 1 / 8, 1 / 16],
    nx * 4,
    ny * 4
  )
  /* tile.distance = tile.water
    ? -tile.distance / minDistance
    : tile.distance / maxDistance */
  // const d = tile.getNeighborIds()
  //   .map(nId => tilemap[nId].distance)
  //   .reduce((prev, curr, _, { length }) => prev + curr / length, 0)
  // if (z <= (d + (d * 0.5)) * maxDistance && z >= (d - (d * 0.5)) * minDistance) {
  // if (z * minDistance <= (d + (d * 1000)) && z * maxDistance >= (d - (d * 1000))) {
  // TODO: clean separation : tile.distance - ((tile.distance / z) * (minDistance / maxDistance)) or tile.distance / z
  if (!tile.water) {
    // tile.ocean = true
    tile.distance = tile.distance - (z * (minDistance / maxDistance))
    // tile.river = true
  } else {
    tile.distance = tile.distance - ((tile.distance * 2) * Math.abs(z) * (maxDistance / minDistance))
  }
  // }
}
console.log(minDistance / maxDistance, maxDistance / minDistance)

// redistribute elevation of lands
const SCALE_FACTOR = 1.1
const land = tilemap
  .filter(tile => !tile.water)
  .sort((t1, t2) => t1.distance - t2.distance)
land.forEach((t, i) => {
  const y = i / (land.length - 1)
  const x = Math.min(Math.sqrt(SCALE_FACTOR) - Math.sqrt(SCALE_FACTOR * (1 - y)), 1)
  const tile = tilemap[t.id]
  tile.distance = x
})

const NUM_RIVERS = 50
const MIN_DISTANCE = 0.3
const MAX_DISTANCE = 0.9
const range = land.filter(tile => tile.distance >= MIN_DISTANCE && tile.distance <= MAX_DISTANCE)
const sources = shuffle(range, alea).slice(0, NUM_RIVERS)

  /* while (sources.length > 0) {
  // let lowerTile = null
  const tile = sources.shift()
  if (!tile.water) {
    tile.river = true
    const lowerTiles = []
    // (i + Math.floor(alea() * neighbors.length)) % neighbors.length
    for (const nId of tile.getNeighborIds()) {
      const neighbor = tilemap[nId]
      if (tile.distance > neighbor.distance) {
        lowerTiles.push(neighbor)
      }
    }
    const n = Math.floor(alea() * lowerTiles.length)
    const lowerTile = lowerTiles[n]
    if (tile.distance > lowerTile.distance) {
      sources.push(lowerTile)
    }
  }
} */

const setRivers = sources => {
  if (sources.length === 0) { return }
  const tile = sources.shift()
  if (!tile.water && !tile.river) {
    tile.river = true
    const neighbors = []
    for (const nId of tile.getNeighborIds()) {
      const neighbor = tilemap[nId]
      if (tile.distance >= neighbor.distance) {
        neighbors.push(neighbor)
      }
    }
    const n = Math.floor(alea() * neighbors.length)
    if (neighbors[n]) {
      const lowerTile = neighbors[n]
      if (tile.distance >= lowerTile.distance) {
        sources.push(lowerTile)
      }
    }
  }
  setRivers(sources)
}
// setRivers(sources)

const canvas = ref()
const canvas2 = ref()
const tileSize = 4
const camera = { x: 0, y: 0 }
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
onMounted(() => {
  /* deltas => {
    let execTime = deltas.reduce((acc, curr) => acc + curr)
    execTime = Math.floor(execTime / 1000 * 100) / 100
    console.log(`${execTime.toString().padEnd(4, '0')}s`)
  } */
  const colorMap = tile => {
    // if (tile.border) { return 'red' }
    if (tile.river) { return 'black' }
    if (tile.coast) { return 'black' }
    // if (tile.ocean) { return 'darkblue' }
    // if (tile.water) { return 'blue' }
    if (tile.water && !tile.ocean) { return '#045aa0' }
    return 'darkred'
    // return `hsl(${(360 * (tile.distance * 150)) / 360}, 80%, 70%)`
  }
  const ctx = canvas.value.getContext('2d')
  for (const tile of tilemap) {
    const { x, y } = tile.site
    ctx.fillStyle = colorMap(tile)
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    ctx.fill()
  }
})
return { canvas, canvas2 }
