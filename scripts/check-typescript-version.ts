const { version } = await Bun.file(
  new URL('../node_modules/typescript/package.json', import.meta.url),
).json();

if (version !== process.versions.typescript) {
  throw new Error(
    `Workspace TypeScript ${version} must match Bun TypeScript ${process.versions.typescript}`,
  );
}
