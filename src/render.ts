import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface RenderHtmlVars {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class RenderHtml {
  async load(view: string, vars: RenderHtmlVars): Promise<string> {
    const findView = fs.existsSync(path.join(__dirname, `./views/${view}.ts`))
    if (!findView) {
      throw new Error(`View ${view} not found`)
    }
    const template = await import('./views/' + view + '.ts')

    return template.default(vars)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadSimple(view: string, data: any): Promise<string> {
    const findView = fs.existsSync(path.join(__dirname, `./views/${view}.ts`))
    if (!findView) {
      throw new Error(`View ${view} not found`)
    }
    const template = await import('./views/' + view + '.ts')

    return template.default(data)
  }

  async render(name: string, vars: RenderHtmlVars): Promise<string> {
    const html = await this.load(name, vars)
    return html
  }

  async renderVideo(name: string, src: string): Promise<string> {
    const html = await this.loadSimple(name, src)
    return html
  }
}

/*=== Exports ===*/
export { RenderHtml }
