import path from 'node:path';
// relative/isAbsolute use the host platform's separators and drive semantics.
// A string prefix is insufficient on Windows and can admit sibling directories.
export function isTrustedCssPath(cssRoot, asset, pathApi = path) {
  const relative = pathApi.relative(cssRoot, asset);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${pathApi.sep}`) &&
    !pathApi.isAbsolute(relative) &&
    pathApi.extname(asset) === '.css'
  );
}
