/* eslint-disable no-unused-vars, camelcase */
import {
  mixp
} from '../util'
export function NoisyEdges () {
  this.recursiveSubdivision = (
    length,
    amplitude,
    randInt
  ) => {
    function recur (a, b, p, q) {
      const divisor = 0x10000000
      const dx = a[0] - b[0]
      const dy = a[1] - b[1]
      if (dx * dx + dy * dy < length * length) { return [b] }

      const ap = mixp([], a, p, 0.5)
      const bp = mixp([], b, p, 0.5)
      const aq = mixp([], a, q, 0.5)
      const bq = mixp([], b, q, 0.5)

      const division = 0.5 * (1 - amplitude) + randInt(divisor) / divisor * amplitude
      const center = mixp([], p, q, division)

      const results1 = recur(a, center, ap, aq)
      const results2 = recur(center, b, bp, bq)

      return results1.concat(results2)
    }
    return recur
  }

  this.assign_s_segments = (
    s_lines,
    mesh,
    {
      amplitude,
      length
    },
    randInt
  ) => {
    const subdivide = this.recursiveSubdivision(length, amplitude, randInt)
    s_lines.length = mesh.numSides
    for (let s = 0; s < mesh.numSides; s++) {
      const t0 = mesh.s_inner_t(s)
      const t1 = mesh.s_outer_t(s)
      const r0 = mesh.s_begin_r(s)
      const r1 = mesh.s_end_r(s)
      if (r0 < r1) {
        if (mesh.s_ghost(s)) {
          s_lines[s] = [mesh.t_pos([], t1)]
        } else {
          s_lines[s] = subdivide(
            mesh.t_pos([], t0),
            mesh.t_pos([], t1),
            mesh.r_pos([], r0),
            mesh.r_pos([], r1)
          )
        }
        // construct line going the other way; since the line is a
        // half-open interval with [p1, p2, p3, ..., pn] but not
        // p0, we want to reverse all but the last element, and
        // then append p0
        const opposite = s_lines[s].slice(0, -1)
        opposite.reverse()
        opposite.push(mesh.t_pos([], t0))
        s_lines[mesh.s_opposite_s(s)] = opposite
      }
    }
    return s_lines
  }
}

export default NoisyEdges
