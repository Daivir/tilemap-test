<template>
  <canvas
    ref="canvas"
    height="937"
    width="937"
  />
</template>

<script>
/* eslint-disable no-unused-vars */
import { onMounted, ref } from 'vue'

import PoissonDiskSampling from 'poisson-disk-sampling'
import Alea from 'alea'
import Voronoi from 'voronoi'
import Paper from 'paper'
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
  this.set = (x, y, z) => (this.data[this.id(x, y)] = z)
}

const alea = new Alea('seed')
const p = new PoissonDiskSampling({
  shape: [937, 937],
  minDistance: 8,
  maxDistance: 8
}, alea)
const sites = []
for (const [x, y] of p.fill()) {
  sites.push({ x, y })
}
const voronoi = new Voronoi()

const noise = new SimplexNoise('pain')
const diagram = voronoi.compute(sites, { xl: 0, xr: 937, yt: 0, yb: 937 })

const getElevation = site => {
  const WAVELENGTH = 0.5
  const JITTER = 0.5
  const nx = site.x / 937 - JITTER
  const ny = site.y / 937 - JITTER
  const e = noise.noise2D(nx / WAVELENGTH, ny / WAVELENGTH) +
    (1 / 2) * noise.noise2D(2 * nx / WAVELENGTH, 2 * ny / WAVELENGTH) +
    (1 / 4) * noise.noise2D(4 * nx / WAVELENGTH, 4 * ny / WAVELENGTH) +
    (1 / 8) * noise.noise2D(8 * nx / WAVELENGTH, 8 * ny / WAVELENGTH) +
    (1 / 16) * noise.noise2D(16 * nx / WAVELENGTH, 16 * ny / WAVELENGTH)
  return e // - Math.sqrt(nx * nx + ny * ny)
}
const getRealElevation = cell => {
  if (cell.water && cell.lakeElevation != null) {
    return cell.lakeElevation
  } else if (cell.water && cell.elevation < 0) {
    return 0
  } else {
    return cell.elevation
  }
}

const getPerlinNoise = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imagedata = ctx.createImageData(canvas.width, canvas.height)
  const data = imagedata.data

  const simplexR = new SimplexNoise('seed1')

  const simplexG = new SimplexNoise('seed2')

  const simplexB = new SimplexNoise('seed3')

  let pos, cr, cg, cb, gray
  for (let y = 0; y < canvas.height / 32; y++) {
    for (let x = 0; x < canvas.width / 32; x++) {
      pos = (x + y * canvas.width) * 4

      cr = Math.floor(((simplexR.noise2D(x / 64, y / 64) + 1) * 0.5) * 255)
      cg = Math.floor(((simplexG.noise2D(x / 64, y / 64) + 1) * 0.5) * 255)
      cb = Math.floor(((simplexB.noise2D(x / 64, y / 64) + 1) * 0.5) * 255)

      gray = (cr + cg + cb) / 3

      data[pos] = gray
      data[pos + 1] = gray
      data[pos + 2] = gray
      data[pos + 3] = 255
    }
  }

  ctx.putImageData(imagedata, 0, 0)
  return imagedata
}

const fillLake = (cell) => {
  if (cell.exitRiver == null) {
    let exitRiver = null
    let exitSource = null
    const lake = []
    const queue = []
    queue.push(cell)

    while (queue.length > 0) {
      const c = queue.shift()
      lake.push(c)
      const neighbors = c.getNeighborIds()
      for (let i = 0; i < neighbors.length; i++) {
        const nId = neighbors[i]
        const neighbor = diagram.cells[nId]

        if (neighbor.water && !neighbor.ocean) { // water cell from the same lake
          if (neighbor.lakeElevation == null || neighbor.lakeElevation < c.lakeElevation) {
            neighbor.lakeElevation = c.lakeElevation
            queue.push(neighbor)
          }
        } else { // ground cell adjacent to the lake
          if (c.elevation < neighbor.elevation) {
            if ((neighbor.elevation - c.lakeElevation) < 0.005) {
              // we fill the ground with water
              neighbor.water = true
              neighbor.lakeElevation = c.lakeElevation
              queue.push(neighbor)
            }
          } else {
            // neighbor.source = true;
            // we found an new exit for the lake :
            if (exitRiver == null || exitRiver.elevation > neighbor.elevation) {
              exitSource = c
              exitRiver = neighbor
            }
          }
        }
      }
    }

    if (exitRiver != null) {
      // we start the exit river :
      exitSource.river = true
      exitSource.nextRiver = exitRiver
      setAsRiver(exitRiver, 1)
      // we mark all the lake as having an exit river :
      while (lake.length > 0) {
        const c = lake.shift()
        c.exitRiver = exitRiver
      }
    }
  }
}
const setAsRiver = (cell, size) => {
  if (!cell.water && !cell.river) {
    cell.river = true
    cell.riverSize = size
    let lowerCell = null
    const neighbors = cell.getNeighborIds()
    // we choose the lowest neighbour cell :
    for (let j = 0; j < neighbors.length; j++) {
      const nId = neighbors[j]
      const neighbor = diagram.cells[nId]
      if (lowerCell == null || neighbor.elevation < lowerCell.elevation) {
        lowerCell = neighbor
      }
    }
    if (lowerCell.elevation < cell.elevation) {
      // we continue the river to the next lowest cell :
      setAsRiver(lowerCell, size)
      cell.nextRiver = lowerCell
    } else {
      // we are in a hole, so we create a lake :
      cell.water = true
      fillLake(cell)
    }
  } else if (cell.water && !cell.ocean) {
    // we ended in a lake, the water level rise :
    cell.lakeElevation = getRealElevation(cell) + (0.005 * size)
    fillLake(cell)
  } else if (cell.river) {
    // we ended in another river, the river size increase :
    cell.riverSize++
    let nextRiver = cell.nextRiver
    while (nextRiver) {
      nextRiver.riverSize++
      nextRiver = nextRiver.nextRiver
    }
  }

  return cell.river
}

export default {
  name: 'App',
  setup () {
    const canvas = ref()
    onMounted(() => {
      const ctx = canvas.value.getContext('2d')
      ctx.save()
      const queue = []
      // water
      diagram.cells.forEach(cell => {
        cell.elevation = getElevation(cell.site) // Math.round(getElevation(cell.site) * 100) / 100
        cell.water = cell.elevation <= 0
        /* cell.halfedges.forEach(hedge => {
          if (hedge.edge.rSite == null) {
            cell.border = true
            cell.ocean = true
            cell.water = true
            if (cell.elevation > 0) {
              cell.elevation = 0
            }
            queue.push(cell)
          }
        }) */
      })
      // ocean
      while (queue.length > 0) {
        const cell = queue.shift()
        const neighbors = cell.getNeighborIds()
        for (let i = 0; i < neighbors.length; i++) {
          const nId = neighbors[i]
          const neighbor = diagram.cells[nId]
          if (neighbor.water && !neighbor.ocean) {
            neighbor.ocean = true
            queue.push(neighbor)
          }
        }
      }
      // coast
      diagram.cells.forEach(cell => {
        let numOcean = 0
        const neighbors = cell.getNeighborIds()
        neighbors.forEach(nId => {
          const neighbor = diagram.cells[nId]
          if (neighbor.ocean) {
            numOcean++
          }
        })
        cell.coast = numOcean > 0 && !cell.water
        cell.beach = cell.coast && cell.elevation < 0.15
      })
      // cliffs
      diagram.edges.forEach(edge => {
        if (edge.lSite != null && edge.rSite != null) {
          const lCell = diagram.cells[edge.lSite.voronoiId]
          const rCell = diagram.cells[edge.rSite.voronoiId]
          edge.cliff = !(lCell.water && rCell.water) &&
            (Math.abs(getRealElevation(lCell) - getRealElevation(rCell)) >= 0.5)
        }
      })
      // rivers
      const getRandomInt = (min, max) => Math.floor(alea() * (max - min + 1)) + min
      for (let i = 0; i < 50; i++) {
        const cell = diagram.cells[getRandomInt(0, diagram.cells.length - 1)]
        if (!cell.coast) {
          if (setAsRiver(cell, 1)) {
            cell.source = true
            i++
          }
        }
      }
      // render
      diagram.cells.forEach(cell => {
        const elevation = getElevation(cell.site)
        ctx.fillStyle = cell.water ? '#455262'
          : `hsl(${(36 - elevation * 5) * 36}, 80%, 70%)`
        const start = cell.halfedges[0].getStartpoint()
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        cell.halfedges.forEach(halfedge => {
          const end = halfedge.getEndpoint()
          ctx.lineTo(end.x, end.y)
        })
        ctx.fill()
      })
      /* for (const cellid in diagram.cells) {
        const cell = diagram.cells[cellid]
        if (cell.nextRiver) {
          let riverPath = new Path()
          riverPath.strokeWidth = Math.min(cell.riverSize, this.config.maxRiversSize)
          var riverColor = DISPLAY_COLORS.RIVER.clone()
          riverColor.brightness = riverColor.brightness - this.getShade(cell)
          riverPath.strokeColor = riverColor
          riverPath.strokeCap = 'round'
          if (cell.water) {
            riverPath.add(new Point(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2))
          } else {
            riverPath.add(new Point(cell.site.x, cell.site.y))
          }
          if (cell.nextRiver && !cell.nextRiver.water) {
            riverPath.add(new Point(cell.nextRiver.site.x, cell.nextRiver.site.y))
          } else {
            riverPath.add(new Point(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2))
          }
        }
        // source :
        if (this.config.allowDebug && cell.source) {
          this.debugLayer.activate()
          var circle = new Path.Circle(new Point(cell.site.x, cell.site.y), 3)
          circle.fillColor = DISPLAY_COLORS.SOURCE
        }
      } */
      // rivers
      diagram.cells.forEach(cell => {
        if (cell.nextRiver) {
          ctx.beginPath()
          ctx.lineWidth = Math.min(cell.riverSize, 4)
          ctx.strokeStyle = '#455262'
          ctx.lineCap = 'round'
          if (cell.water) {
            ctx.moveTo(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2)
          } else {
            ctx.moveTo(cell.site.x, cell.site.y)
          }
          if (cell.nextRiver && !cell.nextRiver.water) {
            ctx.lineTo(cell.nextRiver.site.x, cell.nextRiver.site.y)
          } else {
            ctx.lineTo(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2)
          }
          ctx.closePath()
          ctx.stroke()
          /* ctx.beginPath()
          ctx.strokeStyle = 'red'
          for (let i = 0; i < cell.halfedges.length; i++) {
            ctx.moveTo(cell.halfedges[i].edge.va.x, cell.halfedges[i].edge.va.y)
            ctx.lineTo(cell.nextRiver.halfedges[i].edge.va.x, cell.nextRiver.halfedges[i].edge.va.y)
          } */
          /* if (cell.water) {
            ctx.moveTo(cell.halfedges[0].site.x, cell.halfedges[0].site.y)
            ctx.lineTo(cell.nextRiver.halfedges[0].site.x, cell.nextRiver.halfedges[0].site.y)
          } */
          ctx.closePath()
          ctx.stroke()
        }
        /* if (cell.source) {
          ctx.beginPath()
          ctx.arc(cell.site.x, cell.site.y, 3, 0, 2 * Math.PI)
          ctx.strokeStyle = 'red'
          ctx.stroke()
        } */
      })
      // const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
      // const rdmCell = diagram.cells[getRandomInt(0, diagram.cells.length - 1)]
      /* const rdmCell = diagram.cells[57]
      ctx.beginPath()
      ctx.fillStyle = 'red'
      console.log(rdmCell.halfedges[0].edge.va)
      const p = rdmCell.halfedges[0].edge.va
      const q = rdmCell.halfedges[0].edge.vb
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(q.x, q.y)
      ctx.fillRect(rdmCell.site.x, rdmCell.site.y, 8, 8)
      ctx.stroke() */
      /* for (let e = 0; e < diagram.cells.length; e++) {
        const cell = diagram.cells[e]
        const elevation = getElevation(cell.site)
        cell.water = elevation <= 0
        /!* for (let j = 0; j < cell.halfedges.length; j++) {
          const hedge = cell.halfedges[j]
          if (hedge.edge.rSite == null) {
            cell.border = true
            cell.ocean = true
            // cell.water = true
            if (elevation > 0) {
              elevation = 0
            }
            queue.push(cell)
          }
        }

        while (queue.length > 0) {
          const cell = queue.shift()
          const neighbors = cell.getNeighborIds()
          for (let i = 0; i < neighbors.length; i++) {
            const nId = neighbors[i]
            const neighbor = diagram.cells[nId]
            if (neighbor.water && !neighbor.ocean) {
              neighbor.ocean = true
              queue.push(neighbor)
            }
          }
        }

        let numOcean = 0
        const neighbors = cell.getNeighborIds()
        for (let j = 0; j < neighbors.length; j++) {
          const nId = neighbors[j]
          const neighbor = diagram.cells[nId]
          if (neighbor.ocean) {
            numOcean++
          }
        }
        const edge = diagram.edges[e]
        if (edge.lSite != null && edge.rSite != null) {
          const lCell = diagram.cells[edge.lSite.voronoiId]
          const rCell = diagram.cells[edge.rSite.voronoiId]
          edge.cliff = (!(lCell.water && rCell.water) &&
            (Math.abs(lCell.elevation - rCell.elevation) >= 0.15))
        } *!/
        /!* const setAsRiver = (cell, size) => {
          const neighbors = cell.getNeighborIds()
          let lowerCell = null
          for (let j = 0; j < neighbors.length; j++) {
            const nId = neighbors[j]
            const neighbor = diagram.cells[nId]
            if (lowerCell == null || neighbor.elevation < lowerCell.elevation) {
              lowerCell = neighbor
            }
          }
          if (lowerCell.elevation < cell.elevation) {
            // we continue the river to the next lowest cell :
            setAsRiver(lowerCell, size)
            cell.nextRiver = lowerCell
          } else {
            // we are in a hole, so we create a lake :
            cell.water = true
            // this.fillLake(cell)
          }
        }
        setAsRiver(cell, 1) *!/
        ctx.fillStyle = cell.water ? '#455262' : `hsl(${elevation * 4 * 36}, 80%, 70%)`
        const start = cell.halfedges[0].getStartpoint()
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        for (let i = 0; i < cell.halfedges.length; i++) {
          const end = cell.halfedges[i].getEndpoint()
          ctx.lineTo(end.x, end.y)
        }
        ctx.fill()
        // ctx.stroke()
      } */
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
