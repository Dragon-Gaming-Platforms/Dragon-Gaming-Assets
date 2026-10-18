# ZX Spectrum 48K Emulator

This is a 48K-only JSSpeccy 3.2.0 build. Its original 48K/128K/Pentagon firmware set has been removed. The only system image shipped is Open82, a freely licensed replacement ROM compiled from the included Open82 source; it contains no original Sinclair ROM code. No commercial game images are included.

Use the emulator's File menu to open a 48K snapshot or tape image from your device. For tapes, enter `LOAD ""` in BASIC and start the tape from the emulator controls. Open82 is a replacement firmware and may not be compatible with software that depends on undocumented original-ROM behavior. The emulator is configured for 48K mode only.

## Source and build

- JSSpeccy source and build inputs: `source/jsspeccy3/`.
- Open82 source and build recipe: `source/open82/`; compile with Pasmo and the included Makefile (`make`). The generated `open82.bin` is the shipped `jsspeccy/roms/48.rom`.
- JSSpeccy license: GPL-3.0-only (`LICENSE-JSSPECCY3`). Open82 license: GPL-2.0-only (`LICENSE-OPEN82`). Dependency notices are provided in `LICENSES-*` files.
- Upstream sources: https://github.com/gasman/jsspeccy3 and https://github.com/gasman/openzxrom.

The runtime is self-contained in this folder; it makes no CDN or account requests.
