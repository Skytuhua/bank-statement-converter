// Read a File to text fully in the browser, detecting BOM / UTF-8 / Latin-1.
// Nothing is ever uploaded — this uses the File API only.

export async function readFileSmart(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)

  // UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3))
  }
  // UTF-16 LE/BE BOM
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2))
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2))
  }

  // Try strict UTF-8; if it has invalid sequences, fall back to Windows-1252.
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

export const ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.txt', '.ofx', '.qfx', '.qif']

export function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

// When a file isn't a recognised statement export, give a non-technical user a
// message that explains the likely mistake and what to do next — instead of a
// generic "unrecognised file". The most common mistakes are uploading a PDF or
// scanned statement, a spreadsheet, or an image.
export function describeUnsupportedFile(name: string): string {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  const exports = 'a data-export file (CSV, OFX/QFX, or QIF)'

  if (ext === 'pdf') {
    return `"${name}" looks like a PDF. This tool converts ${exports}, not PDF or scanned statements. On your bank's website, look for "Export" or "Download" and choose CSV or OFX.`
  }
  if (['xls', 'xlsx', 'xlsm', 'numbers', 'ods'].includes(ext)) {
    return `"${name}" looks like a spreadsheet. Open it in your spreadsheet app, then use "Save As" or "Export" to save a CSV — and load that file here.`
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp', 'bmp', 'tiff'].includes(ext)) {
    return `"${name}" looks like an image. This tool needs ${exports} — not a screenshot or photo of a statement.`
  }
  if (['doc', 'docx', 'rtf', 'pages'].includes(ext)) {
    return `"${name}" looks like a document. This tool needs ${exports} that you download from your bank, not a word-processor file.`
  }
  if (['zip', 'rar', '7z', 'gz'].includes(ext)) {
    return `"${name}" is a compressed archive. Unzip it first, then load the CSV, OFX/QFX or QIF file inside.`
  }
  return `Could not recognise "${name}" as CSV, OFX/QFX or QIF. Make sure you're loading a data-export file from your bank (look for "Export" or "Download") — not a PDF or image.`
}
