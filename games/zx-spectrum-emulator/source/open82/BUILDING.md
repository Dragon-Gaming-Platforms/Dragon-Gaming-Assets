# Open82 ROM source

Source copied from https://github.com/gasman/openzxrom. The shipped firmware is built with the included Makefile and the default `FONT=ZX81ACE` setting:

```sh
make
```

This produces `open82.bin`, a 16 KiB, freely licensed 48K replacement ROM. Pasmo is a build-time assembler only; it is not included in the browser runtime. See `COPYING`, `README`, and `AUTHORS` for the upstream terms and provenance.
