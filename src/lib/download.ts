// Save a string to the user's device via a Blob + object URL. No network.

export function downloadText(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Release the object URL on the next tick so the download can start.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
