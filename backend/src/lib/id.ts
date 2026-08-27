// Every id this app mints is a UUIDv7: its leading 48 bits are a millisecond timestamp, so ids
// sort by creation time and each insert lands at the right edge of the primary key's index rather
// than scattering across it the way v4's pure randomness does. One function so the format is one
// edit away for every table that adopts it.
export function uuidv7(): string {
  return Bun.randomUUIDv7();
}
