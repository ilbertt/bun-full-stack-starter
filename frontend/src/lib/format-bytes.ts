const BYTES_PER_UNIT = 1024;
const UNITS = ['B', 'kB', 'MB', 'GB'] as const;
const FRACTION_DIGITS = 1;

export function formatBytes(bytes: number): string {
  let value = bytes;
  let unitIndex = 0;

  while (value >= BYTES_PER_UNIT && unitIndex < UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }

  const unit = UNITS[unitIndex] ?? UNITS[0];
  return `${value.toFixed(unitIndex === 0 ? 0 : FRACTION_DIGITS)} ${unit}`;
}
