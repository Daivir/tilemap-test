/* eslint-disable no-unused-vars, camelcase */
/**
 * @param ctx {CanvasRenderingContext2D}
 * @param map {Map}
 * @param colorMap {Smooth}
 * @constructor
 */
export function Renderer2D (
  ctx,
  map,
  colorMap
) {
  /**
   * @param phase {number} 0 to 15
   * @param filter {(Function|null)}
   * @param noisyEdge {boolean}
   * @returns void
   */
  const noisyEdges = (
    phase,
    filter = null,
    noisyEdge = true
  ) => {
    const { mesh } = map
    const begin = (mesh._triangles.length / 16 * phase) | 0
    const end = (mesh._triangles.length / 16 * (phase + 1)) | 0
    for (let s = begin; s < end; s++) {
      const style = colorMap.side(map, s)
      if (filter && !filter(s, style)) { continue }
      ctx.strokeStyle = style.strokeStyle
      ctx.lineWidth = style.lineWidth
      const last_t = mesh.s_inner_t(s)
      ctx.beginPath()
      ctx.moveTo(mesh.t_x(last_t), mesh.t_y(last_t))
      if (!noisyEdge || !style.noisy) {
        const first_t = mesh.s_outer_t(s)
        ctx.lineTo(mesh.t_x(first_t), mesh.t_y(first_t))
      } else {
        for (const p of map.s_lines[s]) {
          ctx.lineTo(p[0], p[1])
        }
      }
      ctx.stroke()
    }
  }
  /**
   * @return {Renderer2D}
   */
  this.background = () => {
    ctx.fillStyle = '#44447a'
    ctx.fillRect(0, 0, 1000, 1000)
    return this
  }
  /**
   * @param noisyEdges {boolean}
   * @return {Renderer2D}
   */
  this.regions = (
    noisyEdges = true
  ) => {
    const { mesh } = map
    const out_s = []
    ctx.fillStyle = 'red'
    for (let r = 0; r < mesh._r_vertex.length - 1; r++) {
      const style = colorMap.biome(map, r)
      mesh.r_circulate_s(out_s, r)
      const last_t = mesh.s_inner_t(out_s[0])
      ctx.fillStyle = style
      ctx.strokeStyle = style
      ctx.beginPath()
      ctx.moveTo(mesh.t_x(last_t), mesh.t_y(last_t))
      out_s.forEach(s => {
        if (!noisyEdges || !colorMap.side(map, s).noisy) {
          const first_t = mesh.s_outer_t(s)
          ctx.lineTo(mesh.t_x(first_t), mesh.t_y(first_t))
        } else {
          map.s_lines[s].forEach(p => { ctx.lineTo(p[0], p[1]) })
        }
      })
      ctx.fill()
      ctx.stroke()
    }
    return this
  }
  /**
   * @param noisyEdge {boolean}
   * @param fast {boolean}
   * @return {Renderer2D}
   */
  this.rivers = (
    noisyEdge = true,
    fast = false
  ) => {
    if (!fast) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    for (let phase = 0; phase < 16; phase++) {
      noisyEdges(phase, (s, style) => colorMap.draw_river_s(map, s), noisyEdge)
    }
    return this
  }
  /**
   * @param noisyEdge {boolean}
   * @return {Renderer2D}
   */
  this.coastline = (
    noisyEdge = true
  ) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let phase = 0; phase < 16; phase++) {
      noisyEdges(phase, (s, style) => colorMap.draw_coast_s(map, s), noisyEdge)
    }
    return this
  }
}

export default Renderer2D
