/* eslint-disable no-unused-vars */
import SimplexNoise from 'simplex-noise'

const simplex = new SimplexNoise('seed')

const width = 64
const height = 64

const mapArr = Array.from({ length: width * height })

for (let c = 0; c <= height; c++) {
  for (let r = 0; r <= width; r++) {
    const nx = c / width - 0.5
    const ny = r / height - 0.5
    const e = simplex.noise2D(nx, ny) +
      0.5 * simplex.noise2D(2 * nx, 2 * ny) +
      0.25 * simplex.noise2D(4 * nx, 4 * ny)
    mapArr[c * width + r] = e / (1 + 0.5 + 0.25)
  }
}

export default mapArr
