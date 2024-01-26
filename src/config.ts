import { env } from './core'

/*=== Env. variables ===*/
const vars = {
  port: env.get<number>('PORT') ?? 5555,
  host: env.get<string>('HOST') ?? '0.0.0.0',
  baseDir: env.get<string>('BASE_DIR', true),
} as const

/*=== Configs ===*/
const config = {
  vars,
} as const

/*=== Exports ===*/
export { config }
