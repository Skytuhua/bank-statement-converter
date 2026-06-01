/** Join class names, dropping falsy values. */
export function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ')
}
