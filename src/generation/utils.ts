export function normalizeSize(size: { width: number; height: number }, supportedSizes?: string[]): string {
  const userSize = `${size.width}x${size.height}`;
  if (!supportedSizes || supportedSizes.includes(userSize)) {
    return userSize;
  }
  // use biggest TODO: match nearest
  return supportedSizes[supportedSizes.length - 1];
}
