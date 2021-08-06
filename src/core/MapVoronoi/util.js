/* eslint-disable no-unused-vars, camelcase */
export const fbmNoise = (simplex, amplitudes, nx, ny) => {
  let sum = 0
  let sumOfAmplitudes = 0
  for (let octave = 0; octave < amplitudes.length; octave++) {
    const frequency = 1 << octave
    sum += amplitudes[octave] * simplex.noise2D(nx * frequency, ny * frequency, octave)
    sumOfAmplitudes += amplitudes[octave]
  }
  return sum / sumOfAmplitudes
}
export const mix = (a, b, t) => a * (1.0 - t) + b * t
export const randomShuffle = (array, randInt) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    const swap = array[i]
    array[i] = array[j]
    array[j] = swap
  }
  return array
}
export const mixp = (out, p, q, t) => {
  out.length = p.length
  for (let i = 0; i < p.length; i++) {
    out[i] = mix(p[i], q[i], t)
  }
  return out
}
