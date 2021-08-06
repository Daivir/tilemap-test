/**
 * @param w {number} Width
 * @param h {number} Height
 * @constructor
 */
function TileMap (w, h) {
  /** @type {number} Width */
  this.w = w
  /** @type {number} Height */
  this.h = h
  /** @type {Tile[]} */
  this.data = new Array(w * h)
  /**
   * @param x {number}
   * @param y {number}
   * @returns {number}
   */
  this.id = (x, y) => x + this.w * y
  /**
   * @param id {number}
   * @returns {number}
   */
  this.x = (id) => id % this.w
  /**
   * @param id {number}
   * @returns {number}
   */
  this.y = (id) => (id / this.w) | 0
  /**
   * @param x {number}
   * @param y {number}
   * @returns Tile | null
   */
  this.get = (x, y) => this.data[this.id(x, y)] || null
  /**
   * @param x {number}
   * @param y {number}
   * @param tile {Tile}
   * @returns {Tile}
   */
  this.set = (x, y, tile) => {
    tile.id = this.id(x, y)
    this.data[tile.id] = tile
    return tile
  }
  /**
   * @param id {number}
   * @returns {Tile}
   */
  this.find = (id) => this.data[id]
  /**
   * @returns {Tile[]}
   */
  this.all = () => this.data
}

export default TileMap
