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

  return `
    <ul class="flex flex-col gap-3 pl-3">
      ${dirs
        .map(
          (dir: any) => `
      <li>
        <a href="/browse${dirPath}${dir}">
        <span class="lnr lnr-home"></span>
        <span>${dir}</span>
        </a>
      </li>
      `,
        )
        .join('')}
    </ul>
  `
}

async function makeFileList(files: string[], path?: string) {
  if (path) {
    path = path.replace(/\/+$/g, '')
  }
  const filePath = path ? `${path}/` : '/'
  return `
    <ul class="flex flex-col gap-3 pl-3">
      ${files
        .map(
          (file: any) => `
      <li>
        <a href="/stream${filePath}${file}">
        <span class="lnr lnr-download"></span>
        <span>${file}</span>
        </a>
      </li>
      `,
        )
        .join('')}
    </ul>
  `
}

export default async function (vars: RenderHtmlVars) {
  const dirs = await makeDirList(vars.directories, vars.path)
  const files = await makeFileList(vars.files, vars.path)

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
      <h1 class="text-4xl text-center text-orange-500">File Explorer</h1>
      <h2>Directories: (${vars.directories.length})</h2>
      ${dirs}
      <h2>Files: (${vars.files.length})</h2>
      ${files}
    </body>
  </html>
  `
}
