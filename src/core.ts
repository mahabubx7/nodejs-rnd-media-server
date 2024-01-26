import 'dotenv/config'

/**
 * @class Env
 * @description Parsing env variables with type-safe
 */

class Env {
  get<T = string>(varName: string, required: true): T
  get<T = string>(varName: string, required?: false): T | undefined
  get<T = string>(varName: string, required = false): T | undefined {
    try {
      const value = process.env[varName] as T | undefined
      if (!value && required) {
        throw new Error(`Environment variable ${varName} is not defined`)
      }

      return required ? value! : value
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}

const env = new Env()

/*=== Exports ===*/
export { env }
