export function createTextDiff(filePath: string, before: string, after: string): string {
  if (!before)
    return [
      `--- ${filePath}`,
      `+++ ${filePath}`,
      ...after.split(/\r?\n/).map((line) => `+${line}`)
    ].join('\n')

  if (before === after) return `No changes for ${filePath}`

  const beforeLines = before.split(/\r?\n/)
  const afterLines = after.split(/\r?\n/)
  const commonPrefixLength = countCommonPrefix(beforeLines, afterLines)
  const beforeRemainder = beforeLines.slice(commonPrefixLength)
  const afterRemainder = afterLines.slice(commonPrefixLength)
  const commonSuffixLength = countCommonSuffix(beforeRemainder, afterRemainder)
  const removed = beforeRemainder.slice(0, beforeRemainder.length - commonSuffixLength)
  const added = afterRemainder.slice(0, afterRemainder.length - commonSuffixLength)

  return [
    `--- ${filePath}`,
    `+++ ${filePath}`,
    `@@ -${commonPrefixLength + 1},${Math.max(removed.length, 1)} +${commonPrefixLength + 1},${Math.max(added.length, 1)} @@`,
    ...removed.map((line) => `-${line}`),
    ...added.map((line) => `+${line}`)
  ].join('\n')
}

function countCommonPrefix(left: string[], right: string[]): number {
  let index = 0
  while (index < left.length && index < right.length && left[index] === right[index]) index++
  return index
}

function countCommonSuffix(left: string[], right: string[]): number {
  let count = 0
  while (
    count < left.length &&
    count < right.length &&
    left[left.length - count - 1] === right[right.length - count - 1]
  ) {
    count++
  }
  return count
}
