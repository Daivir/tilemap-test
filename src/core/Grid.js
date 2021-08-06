function TileSet (size) {
  const [h, w] = size
  const nodes = []
  const grid = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      nodes.push({ x, y })
    }
  }
  this.create = (val = ({ x, y }) => 0) => {
    for (let i = 0; i < nodes.length; i++) {
      grid.push(val(nodes[i]))
    }
  }
  this.read = () => {}
  this.update = () => {}
  this.delete = () => {}
}
