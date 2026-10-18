# JSSpeccy source and local changes

This is the corresponding source/build input for the JSSpeccy 3.2.0 browser bundle in the parent game folder. It is based on https://github.com/gasman/jsspeccy3 and retains that project's GPL-3 license in `COPYING`.

Local changes:

- `runtime/jsspeccy.js` loads only the 48K `static/roms/48.rom` image and exposes only the 48K machine profile.
- That image is the separately licensed Open82 firmware, not one of the original Sinclair ROMs.
- The non-48K firmware and tape-loader files have been omitted from `static/`.
- `package.json` license metadata is corrected to GPL-3.0-only, JSZip is updated to 3.10.1, and the unused `npm-watch` dependency/test script are removed.
- `webpack.config.js` uses CommonJS export for compatibility with the bundled webpack-cli.

To rebuild the engine in this folder, run `npm ci` and `npm run build:release`. The engine files are emitted under `dist/jsspeccy/`; the outer page and Open82 license/source live in the parent game folder.
