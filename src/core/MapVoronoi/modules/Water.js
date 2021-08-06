/* eslint-disable no-unused-vars, camelcase */
import {
  fbmNoise,
  mix
} from '../util'

export function Water () {
  this.assign_r_water = (r_water, mesh, noise, params) => {
    r_water.length = mesh._r_vertex.length
    for (let r = 0; r < mesh._r_vertex.length; r++) {
      if (mesh._r_vertex.length - 1 === r) {
        r_water[r] = true
      } else {
        const nx = (mesh._r_vertex[r][0] - 500) / 500
        const ny = (mesh._r_vertex[r][1] - 500) / 500
        const n = fbmNoise(noise, params.amplitudes, nx, ny)
        r_water[r] = n < 0
      }
      if (mesh._r_vertex.length - 1 === r || mesh.numBoundaryRegions > r) {
        r_water[r] = true
      } else {
        const nx = (mesh.r_x(r) - 500) / 500
        const ny = (mesh.r_y(r) - 500) / 500
        const distance = Math.max(Math.abs(nx), Math.abs(ny))
        let n = fbmNoise(noise, params.amplitudes, nx, ny)
        r_water[r] = n < 0
        n = mix(n, 0.5, params.round)
        r_water[r] = n - (1.0 - params.inflate) * distance * distance < 0
      }
    }
    return r_water
  }

  this.assign_r_ocean = (r_ocean, mesh, r_water) => {
    r_ocean.length = mesh._r_vertex.length
    r_ocean.fill(false)
    const stack = [mesh._r_vertex.length - 1]
    const r_out = []
    while (stack.length > 0) {
      const r1 = stack.pop()
      mesh.r_circulate_r(r_out, r1)
      for (const r2 of r_out) {
        if (r_water[r2] && !r_ocean[r2]) {
          r_ocean[r2] = true
          stack.push(r2)
        }
      }
    }
    return r_ocean
  }
}

export default Water
