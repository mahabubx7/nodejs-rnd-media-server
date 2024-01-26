import { config } from './config'
import { handler } from './server'

const { vars } = config

async function boot() {
  await handler.start(vars.port, vars.host)
}

await boot()
