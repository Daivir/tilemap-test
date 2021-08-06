/* eslint-disable */
self.addEventListener('message', e => {
  const { canvas } = e.data
  const interval = 1000 / 20
  let then = performance.now()
  const ctx = canvas.getContext('2d')
  const frame = now => {
    if (now > then + interval) {
      then = now
      update((now + interval) % then)
    }
    requestAnimationFrame(frame)
  }
  function update () {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = `hsl(${Math.floor(Math.random() * 10) * 36}, 70%, 80%)`
    ctx.fillRect(0, 0, 20, 20)
    ctx.fill()
  }
  requestAnimationFrame(frame)
})

/* self.onmessage = e => {
} */
