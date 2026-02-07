export type ZipEntry = { compressedBytes: number; uncompressedBytes: number; depth: number };

export function zipBombGuard(entries: ZipEntry[], limits = { maxFiles: 200, maxDepth: 6, maxTotalUncompressed: 500 * 1024 * 1024, maxRatio: 150 }) {
  const totalUncompressed = entries.reduce((s, e) => s + e.uncompressedBytes, 0);
  const totalCompressed = Math.max(entries.reduce((s, e) => s + e.compressedBytes, 0), 1);
  const ratio = totalUncompressed / totalCompressed;
  const tooManyFiles = entries.length > limits.maxFiles;
  const tooDeep = entries.some((e) => e.depth > limits.maxDepth);
  const tooLarge = totalUncompressed > limits.maxTotalUncompressed;
  const tooCompressed = ratio > limits.maxRatio;

  return { safe: !(tooManyFiles || tooDeep || tooLarge || tooCompressed), reasons: { tooManyFiles, tooDeep, tooLarge, tooCompressed } };
}
