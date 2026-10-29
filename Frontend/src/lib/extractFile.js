// Turns an uploaded PDF / Word / image file into something the generate-questions
// function can use: either plain text, or JPEG page images (photos and scanned PDFs).
// pdf.js and mammoth are large, so they are loaded only when a file is actually uploaded.

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ACCEPT = '.pdf,.docx,image/png,image/jpeg,image/webp'

const MAX_PDF_PAGES = 10
const MIN_TEXT_CHARS_PER_PAGE = 40 // below this a PDF is treated as scanned
const MAX_TEXT_CHARS = 60000

export async function extractFromFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('That file is larger than 10 MB.')
  }

  const name = file.name.toLowerCase()

  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(name)) {
    return { kind: 'images', images: [await imageToJpeg(file)] }
  }
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractPdf(file)
  }
  if (name.endsWith('.docx')) {
    return extractDocx(file)
  }
  if (name.endsWith('.doc')) {
    throw new Error('Old .doc files are not supported. Save it as .docx and try again.')
  }
  throw new Error('Unsupported file. Upload a PDF, Word (.docx) file, or image.')
}

async function extractDocx(file) {
  const mammoth = (await import('mammoth')).default
  let value
  try {
    ;({ value } = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    }))
  } catch {
    throw new Error('Could not read that Word file. It may be corrupted.')
  }
  const text = value.trim()
  if (!text) throw new Error('No text was found in that Word file.')
  return { kind: 'text', text: text.slice(0, MAX_TEXT_CHARS) }
}

async function extractPdf(file) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  let pdf
  try {
    pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  } catch {
    throw new Error('Could not read that PDF. It may be corrupted or password protected.')
  }

  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES)
  let text = ''
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + '\n'
  }

  if (text.replace(/\s/g, '').length >= MIN_TEXT_CHARS_PER_PAGE * pageCount) {
    return { kind: 'text', text: text.trim().slice(0, MAX_TEXT_CHARS) }
  }

  // Scanned PDF: render each page to a JPEG for Gemini to read.
  const images = []
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    await page.render({ canvas, viewport }).promise
    images.push(canvasToImage(canvas, 0.75))
  }
  return { kind: 'images', images }
}

// Downscale photos so the request body stays small.
async function imageToJpeg(file, maxDimension = 1600) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Could not read that image. Try a JPEG or PNG.')
  }
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvasToImage(canvas, 0.85)
}

function canvasToImage(canvas, quality) {
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  return { mimeType: 'image/jpeg', data: dataUrl.split(',')[1] }
}
