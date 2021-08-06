/* eslint-disable no-unused-vars, camelcase */
export function Moisture () {
  const find_riverbanks_r = (
    out_r,
    mesh,
    s_flow
  ) => {
    for (let s = 0; s < mesh.numSolidSides; s++) {
      if (s_flow[s] > 0) {
        out_r.add(mesh.s_begin_r(s))
        out_r.add(mesh.s_end_r(s))
      }
    }
  }

  const find_lakeshores_r = (
    out_r,
    mesh,
    r_ocean,
    r_water
  ) => {
    for (let s = 0; s < mesh.numSolidSides; s++) {
      const r0 = mesh.s_begin_r(s)
      const r1 = mesh.s_end_r(s)
      if (r_water[r0] && !r_ocean[r0]) {
        out_r.add(r0)
        out_r.add(r1)
      }
    }
  }

  this.find_moisture_seeds_r = (
    mesh,
    s_flow,
    r_ocean,
    r_water
  ) => {
    const seeds_r = new Set()
    find_riverbanks_r(seeds_r, mesh, s_flow)
    find_lakeshores_r(seeds_r, mesh, r_ocean, r_water)
    return seeds_r
  }

  this.redistribute_r_moisture = (
    r_moisture,
    mesh,
    r_water,
    min_moisture,
    max_moisture
  ) => {
    const land_r = []
    for (let r = 0; r < mesh.numSolidRegions; r++) {
      if (!r_water[r]) {
        land_r.push(r)
      }
    }

    land_r.sort((r1, r2) => r_moisture[r1] - r_moisture[r2])

    for (let i = 0; i < land_r.length; i++) {
      r_moisture[land_r[i]] = min_moisture + (max_moisture - min_moisture) * i / (land_r.length - 1)
    }
  }

  this.assign_r_moisture = (
    r_moisture,
    r_waterdistance,
    mesh,
    r_water,
    seed_r
  ) => {
    r_waterdistance.length = mesh.numRegions
    r_moisture.length = mesh.numRegions
    r_waterdistance.fill(null)

    const out_r = []
    const queue_r = Array.from(seed_r)
    let maxDistance = 1
    queue_r.forEach((r) => { r_waterdistance[r] = 0 })
    while (queue_r.length > 0) {
      const current_r = queue_r.shift()
      mesh.r_circulate_r(out_r, current_r)
      for (const neighbor_r of out_r) {
        if (!r_water[neighbor_r] && r_waterdistance[neighbor_r] === null) {
          const newDistance = 1 + r_waterdistance[current_r]
          r_waterdistance[neighbor_r] = newDistance
          if (newDistance > maxDistance) { maxDistance = newDistance }
          queue_r.push(neighbor_r)
        }
      }
    }

    r_waterdistance.forEach((d, r) => {
      r_moisture[r] = r_water[r] ? 1.0 : 1.0 - Math.pow(d / maxDistance, 0.5)
    })
  }
}

export default Moisture
