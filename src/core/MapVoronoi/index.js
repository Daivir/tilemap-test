/* eslint-disable no-unused-vars, camelcase */
import SimplexNoise from 'simplex-noise'
import hashInt from 'hash-int'
import {
  Water,
  Elevation,
  Rivers,
  Moisture,
  Biomes,
  NoisyEdges
} from './modules'
import {
  fbmNoise,
  randomShuffle
} from './util'

class Prng {
  static makeRandInt (seed) {
    let i = 0
    return function (N) {
      i++
      return hashInt(seed + i) % N
    }
  }

  static makeRandFloat (seed) {
    const randInt = this.makeRandInt(seed)
    const divisor = 0x10000000
    return function () {
      return randInt(divisor) / divisor
    }
  }
}

export function Map (mesh) {
  let spring_t = []
  this.mesh = mesh
  this.r_water = []
  this.r_ocean = []
  this.r_elevation = []
  this.t_elevation = []
  this.t_coastdistance = []
  this.t_downslope_s = []
  this.s_flow = []
  this.r_moisture = []
  this.r_waterdistance = []
  this.r_coast = []
  this.r_temperature = []
  this.r_biome = []
  const noisyEdges = new NoisyEdges()
  this.s_lines = noisyEdges.assign_s_segments(
    [],
    this.mesh,
    {
      length: 10,
      amplitude: 0.2,
      seed: 0
    },
    Prng.makeRandInt(0)
  )
  const numRivers = 30
  const biomeBias = {
    north_temperature: 0,
    south_temperature: 0,
    moisture: 0
  }
  const water = new Water(mesh)
  const elevation = new Elevation()
  const rivers = new Rivers()
  const moisture = new Moisture()
  const biomes = new Biomes()
  const noise = new SimplexNoise('xccxcx')
  this.generate = () => {
    water.assign_r_water(
      this.r_water,
      noise,
      {
        round: 0.5,
        inflate: 0.4,
        amplitudes: [1 / 2, 1 / 4, 1 / 8, 1 / 16]
      }
    )
    water.assign_r_ocean(
      this.r_ocean,
      this.r_water
    )
    elevation.assign_t_elevation(
      this.t_elevation,
      this.t_coastdistance,
      this.t_downslope_s,
      this.mesh,
      this.r_ocean,
      this.r_water,
      Prng.makeRandInt(0)
    )
    elevation.redistribute_t_elevation(
      this.t_elevation,
      this.mesh
    )
    elevation.assign_r_elevation(
      this.r_elevation,
      this.mesh,
      this.t_elevation,
      this.r_ocean
    )
    spring_t = rivers.find_spring_t(
      this.mesh,
      this.r_water,
      this.t_elevation,
      this.t_downslope_s
    )
    randomShuffle(spring_t, Prng.makeRandInt(0))
    const river_t = spring_t.slice(0, numRivers)
    rivers.assign_s_flow(
      this.s_flow,
      this.mesh,
      this.t_downslope_s,
      river_t
    )
    moisture.assign_r_moisture(
      this.r_moisture,
      this.r_waterdistance,
      this.mesh,
      this.r_water,
      moisture.find_moisture_seeds_r(this.mesh, this.s_flow, this.r_ocean, this.r_water)
    )
    moisture.redistribute_r_moisture(
      this.r_moisture,
      this.mesh,
      this.r_water,
      biomeBias.moisture,
      1 + biomeBias.moisture
    )
    biomes.assign_r_coast(
      this.r_coast,
      this.mesh,
      this.r_ocean
    )
    biomes.assign_r_temperature(
      this.r_temperature,
      this.mesh,
      this.r_ocean,
      this.r_water,
      this.r_elevation,
      this.r_moisture,
      biomeBias.north_temperature,
      biomeBias.south_temperature
    )
    biomes.assign_r_biome(
      this.r_biome,
      this.mesh,
      this.r_ocean,
      this.r_water,
      this.r_coast,
      this.r_temperature,
      this.r_moisture
    )
  }
}
