/**
 * @param site {{x: number, y: number}}
 * @constructor
 */
function Tile (site) {
  this.site = site
  /** @type int | null */
  this.id = null
  /** @type boolean */
  this.water = false
  /** @type boolean */
  this.ocean = false
  /** @type boolean */
  this.coast = false
  /** @type boolean */
  this.border = false
  /** @type number | null */
  this.distance = null
  /**
   * @returns {[{
   * rSite: {x: number, y: number}, lSite: {x: number, y: number}},
   * {rSite: {x: number, y: number}, lSite: {x: number, y: number}},
   * {rSite: {x: number, y: number}, lSite: {x: number, y: number}},
   * {rSite: {x: number, y: number}, lSite: {x: number, y: number}
   * }]}
   */
  this.edges = () => {
    const { x, y } = site
    return [
      { lSite: { x, y }, rSite: { x: x + 1, y } },
      { lSite: { x: x + 1, y }, rSite: { x: x + 1, y: y + 1 } },
      { lSite: { x: x + 1, y: y + 1 }, rSite: { x: x, y: y + 1 } },
      { lSite: { x: x, y: y + 1 }, rSite: { x, y } }
    ]
  }
  /**
   * @param tilemap {TileMap}
   * @returns {(number | null)[]}
   */
  this.getNeighborIds = tilemap => {
    /* const neighborX = this.tilemap.get(x - 1, y)
        if (neighborX !== null && x !== 0) {
          if (tile.water && !neighborX.water) {
            neighborX.coast = true
          }
          if (!tile.water && neighborX.water) {
            tile.coast = true
          }
        }
        const neighborY = this.tilemap.get(x, y - 1)
        if (neighborY !== null && y !== 0) {
          if (tile.water && !neighborY.water) {
            neighborY.coast = true
          }
          if (!tile.water && neighborY.water) {
            tile.coast = true
          }
        } */
    const { x, y } = this.site
    const neighborIds = []
    for (let nx = x - 1; nx <= x + 1; nx++) {
      for (let ny = y - 1; ny <= y + 1; ny++) {
        const neighbor = tilemap.get(nx, ny)
        if (neighbor !== null && this.id !== neighbor.id) {
          if (nx >= 0 && nx < tilemap.w) {
            neighborIds.push(neighbor.id)
          }
        } else {
          neighborIds.push(null)
        }
      }
    }
    return neighborIds
  }
}

export default Tile
