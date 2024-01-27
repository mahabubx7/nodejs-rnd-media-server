import { contentType, getContentType } from '../utils/media'

interface RenderHtmlVars {
  directories: string[]
  files: string[]
  path: string
}

async function makeDirList(dirs: string[], path?: string) {
  if (path) {
    path = path.replace(/\/+$/g, '')
  }
  const dirPath = path ? `${path}/` : '/'

  if (dirs.length === 0)
    return '<p class="text-center text-xl italic text-gray-500">No directories found!</p>'

  return `
    <div class="dirs">
      <ul class="dirs_container border-2 border-gray-300 rounded-lg">
        ${dirs
          .map(
            (dir: any) => `
        <li class="dir_item">
          <a href="/browse${dirPath}${dir}">
          <span class="lnr lnr-enter"></span>
          <span>${dir}</span>
          </a>
        </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
}

async function cleanUpFiles(files: string[]) {
  const supportedMimeTypes: string[] = [...Object.keys(contentType)]

  return files.filter((file) => {
    const ext = file.replace(/.*\./, '').toLowerCase()
    if (ext && supportedMimeTypes.includes(ext)) {
      return file
    }
  })
}

function processIcons(ext: string): string {
  return getContentType(ext).split('/')[0]
}

function getIcon(ext: string): string {
  const mime = processIcons(ext)
  switch (mime) {
    case 'image':
      return 'lnr-picture'
    case 'video':
      return 'lnr-film-play'
    case 'audio':
      return 'lnr-volume-high'
    case 'text':
      return 'lnr-file-empty'
    case 'application':
      return 'lnr-file-add'
    default:
      return 'lnr-file-empty'
  }
}

async function makeFileList(
  files: string[],
  path?: string,
): Promise<[string, number]> {
  if (path) {
    path = path.replace(/\/+$/g, '')
  }

  files = await cleanUpFiles(files)
  const length = files.length
  let fileListRender: string

  if (length === 0) {
    fileListRender =
      '<p class="text-center text-xl italic text-gray-500">No files found!</p>'
    return [fileListRender, length]
  }

  const filePath = path ? `${path}/` : '/'

  fileListRender = `
    <ul class="flex flex-col gap-3 pl-3">
      ${files
        .map(
          (file: any) => `
      <li>
        <a href="/stream${filePath}${file}">
        ${`<span class="lnr ${getIcon(
          file.replace(/.*\./, '').toLowerCase(),
        )}"></span>`}
        <span>${file}</span>
        </a>
      </li>
      `,
        )
        .join('')}
    </ul>
  `

  return [fileListRender, length]
}

export default async function (vars: RenderHtmlVars) {
  const dirs = await makeDirList(vars.directories, vars.path)
  const [files, filesLength] = await makeFileList(vars.files, vars.path)

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>File Explorer</title>
      <link rel="stylesheet" href="/assets/linearicons.min.css" />
      <link rel="stylesheet" href="/assets/main.css" />
    </head>
    <body>
      <h1 class="text-4xl font-bold text-center text-orange-500 mt-3 mb-5">
        <span class="lnr lnr-briefcase"></span>
        <span>File Explorer</span>
      </h1>
      
      <p class="my-2 ml-1.5 w-full flex justify-end items-center">
        <a href="/browse" class="go_home">
          <span class="lnr lnr-home"></span>
          <span>Home</span>
        </a>
        <button onclick="history.back()" class="go_back">
          <span class="lnr lnr-chevron-left-circle"></span>
          <span>Go Back</span>
        </button>
      </p>
      <h2>Directories: (${vars.directories.length})</h2>
      ${dirs}

      <h2>Files: (${filesLength})</h2>
      ${files}
    </body>
  </html>
  `
}
