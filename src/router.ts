import http from 'http'
import url from 'url'
import fs from 'fs'
import path from 'path'
import { RenderHtml } from './render'
import { getContentType } from './utils/media'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type RouterHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => void

interface Route {
  method: string
  path: string
  handler: RouterHandler
}

interface RouterArgs {
  logger?: 'tiny' | 'details'
  baseDir: string
}

class Router {
  private routes: Route[]
  private logger: RouterArgs['logger']
  private baseDir: string
  private renderer: RenderHtml = new RenderHtml()

  constructor(args: RouterArgs) {
    this.routes = []
    this.logger = args.logger
    this.baseDir = args.baseDir
  }

  get(path: string, handler: RouterHandler): void {
    this.routes.push({
      method: 'GET',
      path,
      handler,
    })
  }

  post(path: string, handler: RouterHandler): void {
    this.routes.push({
      method: 'POST',
      path,
      handler,
    })
  }

  private handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): void {
    const reqUrl = req.url!.replace(/%20/g, ' ').replace(/\/+/g, '/')
    const parsedUrl = url.parse(reqUrl, true)
    if (this.logger) {
      const urlQs =
        Object.keys(parsedUrl.query).length > 1
          ? `?${JSON.stringify(parsedUrl.query)}`
          : ''
      /*=== Logger ===*/
      const log: string =
        this.logger === 'tiny'
          ? `${req.method}: ${parsedUrl.pathname}${urlQs}`
          : `${new Date(Date.now()).toUTCString()} ${req.method}: ${
              parsedUrl.pathname
            }${urlQs}`
      console.info(log)
    }
    const route = this.routes.find(
      (r) => r.method === req.method && r.path === parsedUrl.pathname,
    )

    if (route) {
      route.handler(req, res)
    } else if (parsedUrl.pathname?.startsWith('/browse')) {
      return this.handleListFiles(req, res)
    } else if (parsedUrl.pathname?.startsWith('/stream')) {
      return this.handleStream(req, res)
    } else if (parsedUrl.pathname?.startsWith('/watch')) {
      return this.streamVideo(req, res)
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Endpoint Not found!' }))
    }
  }

  public handleListFiles(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): void {
    const currentPath = req.url
      ?.replace('/browse', '')
      .replace(/%20/g, ' ')
      .replace(/\/+/g, '/')
    const currDir = currentPath && currentPath?.length > 0 ? currentPath : ''
    const targetPath = path.join(__dirname, `./../${this.baseDir}${currDir}`) // Change this to your target directory
    fs.readdir(targetPath, async (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
        return
      }

      const result: { directories: string[]; files: string[]; path: string } = {
        directories: [],
        files: [],
        path: currDir,
      }

      files.forEach((file) => {
        const fullPath = path.join(targetPath, file)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
          result.directories.push(file)
        } else {
          result.files.push(file)
        }
      })

      const renderedHtml = await this.renderer.render('list', result)

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(renderedHtml)
    })
  }

  private handleStaticFile(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): void {
    const filePath = path.join(__dirname, req.url!.substring(1)) // Adjust the path based on your project structure
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(err)
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
        return
      }
      const ext = path.extname(filePath).replace('.', '')
      const contentType = getContentType(ext)

      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  }

  /*===== Handle Streaming =====*/
  handleStream(req: http.IncomingMessage, res: http.ServerResponse): void {
    const currentPath = req
      .url!.replace('/stream', '')
      .replace(/%20/g, ' ')
      .replace(/\/+/g, '/')
    const targetPath = path.join(
      __dirname,
      `./../${this.baseDir}${currentPath}`,
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fs.stat(targetPath, async (err, stats) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
        return
      }

      const ext = path.extname(targetPath).toLowerCase().replace('.', '')
      const contentType = getContentType(ext)
      if (!(contentType.length > 0)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Unsupported Media Type or invalid request!')
        return
      }

      console.info('Streaming: ', contentType)

      // range
      const range = req.headers.range
      if (!range || range.length <= 1) {
        // Set appropriate headers for streaming or downloading
        if (contentType.includes('video')) {
          console.log('Video caught without range: ', contentType, range)
          const videoSrc = currentPath!.replace('/stream', '/watch')
          const htmlContent = await this.renderer.renderVideo('video', videoSrc)

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(htmlContent)
          return
        } else {
          // For other user-agents, trigger a file download
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
          })

          const fileStream = fs.createReadStream(targetPath)
          fileStream.pipe(res)
        }
      } else {
        // Set appropriate headers for streaming
        const positions = range.replace(/bytes=/, '').split('-')
        const start = parseInt(positions[0], 10)
        const total = stats.size
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1
        const chunksize = end - start + 1
        const file = fs.createReadStream(targetPath, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        }
        res.writeHead(206, head)
        file.pipe(res)
      }
    })
  }

  /*===== Handle Video Streaming =====*/
  streamVideo(req: http.IncomingMessage, res: http.ServerResponse): void {
    const currentPath = req
      .url!.replace('/watch', '')
      .replace(/%20/g, ' ')
      .replace(/\/+/g, '/')
    const videoPath = path.join(__dirname, `./../${this.baseDir}${currentPath}`)

    fs.stat(videoPath, (err, stats) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
        return
      }

      const ext = path.extname(videoPath).toLowerCase().replace('.', '')
      const contentType = getContentType(ext)
      if (!(contentType.length > 0)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Unsupported Media Type or invalid request!')
        return
      }

      const range = req.headers.range
      if (!range || range.length <= 1) {
        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size,
        })

        const videoStream = fs.createReadStream(videoPath)
        videoStream.pipe(res)
      } else {
        const positions = range.replace(/bytes=/, '').split('-')
        const start = parseInt(positions[0], 10)
        const total = stats.size
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1
        const chunksize = end - start + 1
        const videoStream = fs.createReadStream(videoPath, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head)
        videoStream.pipe(res)
      }
    })
  }

  async createServer() {
    return await Promise.resolve(
      http.createServer((req, res) => {
        if (req.url!.startsWith('/assets/')) {
          this.handleStaticFile(req, res)
        } else {
          this.handleRequest(req, res)
        }
      }),
    ).catch((err) => {
      console.error(err)
      throw err
    })
  }

  async start(port: number, host?: string): Promise<void> {
    const server = await this.createServer()

    server.listen(port, () => {
      const url = `http://${host ?? '0.0.0.0'}:${port}`
      console.log(`🖥️ Simple OTT is up & running at ${url}`)
    })
  }
}

/*=== Exports ===*/
export { Router }
