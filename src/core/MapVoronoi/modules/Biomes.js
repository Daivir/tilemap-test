/* eslint-disable no-unused-vars, camelcase */
import {
  mix
} from '../util'
export function Biomes () {
  const biome = (
    ocean,
    water,
    coast,
    temperature,
    moisture
  ) => {
    if (ocean) {
      return 'OCEAN'
    } else if (water) {
      if (temperature > 0.9) return 'MARSH'
      if (temperature < 0.2) return 'ICE'
      return 'LAKE'
    } else if (coast) {
      return 'BEACH'
    } else if (temperature < 0.2) {
      if (moisture > 0.50) return 'SNOW'
      else if (moisture > 0.33) return 'TUNDRA'
      else if (moisture > 0.16) return 'BARE'
      else return 'SCORCHED'
    } else if (temperature < 0.4) {
      if (moisture > 0.66) return 'TAIGA'
      else if (moisture > 0.33) return 'SHRUBLAND'
      else return 'TEMPERATE_DESERT'
    } else if (temperature < 0.7) {
      if (moisture > 0.83) return 'TEMPERATE_RAIN_FOREST'
      else if (moisture > 0.50) return 'TEMPERATE_DECIDUOUS_FOREST'
      else if (moisture > 0.16) return 'GRASSLAND'
      else return 'TEMPERATE_DESERT'
    } else {
      if (moisture > 0.66) return 'TROPICAL_RAIN_FOREST'
      else if (moisture > 0.33) return 'TROPICAL_SEASONAL_FOREST'
      else if (moisture > 0.16) return 'GRASSLAND'
      else return 'SUBTROPICAL_DESERT'
    }
  }

  this.assign_r_coast = (
    r_coast,
    mesh,
    r_ocean
  ) => {
    r_coast.length = mesh.numRegions
    r_coast.fill(false)

    const out_r = []
    for (let r1 = 0; r1 < mesh.numRegions; r1++) {
      mesh.r_circulate_r(out_r, r1)
      if (!r_ocean[r1]) {
        for (const r2 of out_r) {
          if (r_ocean[r2]) {
            r_coast[r1] = true
            break
          }
        }
      }
    }
    return r_coast
  }

  this.assign_r_temperature = (
    r_temperature,
    mesh,
    r_ocean,
    r_water,
    r_elevation,
    r_moisture,
    bias_north,
    bias_south
  ) => {
    r_temperature.length = mesh.numRegions
    for (let r = 0; r < mesh.numRegions; r++) {
      const latitude = mesh.r_y(r) / 1000 /* 0.0 - 1.0 */
      const d_temperature = mix(bias_north, bias_south, latitude)
      r_temperature[r] = 1.0 - r_elevation[r] + d_temperature
    }
    return r_temperature
  }

  this.assign_r_biome = (
    r_biome,
    mesh,
    r_ocean,
    r_water,
    r_coast,
    r_temperature,
    r_moisture
  ) => {
    r_biome.length = mesh.numRegions
    for (let r = 0; r < mesh.numRegions; r++) {
      r_biome[r] = biome(r_ocean[r], r_water[r], r_coast[r],
        r_temperature[r], r_moisture[r])
    }
    return r_biome
  }
}

export default Biomes
