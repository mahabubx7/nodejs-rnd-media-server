function getContentType(ext: string) {
  return contentType[ext] ?? 'text/plain'
}

const contentType: Record<string, string> = {
  css: 'text/css',
  gif: 'image/gif',
  avif: 'image/avif',
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  txt: 'text/plain',
  wav: 'audio/wav',
  weba: 'audio/webm',
  webm: 'video/webm',
  mp4: 'video/mp4',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mpeg: 'video/mpeg',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
}

/*=== Exports ===*/
export { getContentType }
