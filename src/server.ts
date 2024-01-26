import { config } from './config'
import { Router } from './router'

const handler = new Router({ logger: 'tiny', baseDir: config.vars.baseDir })

handler.get('/', (req, res) => {
  const url = req.url!
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ url }))
})

/*=== Exports ===*/
export { handler }
