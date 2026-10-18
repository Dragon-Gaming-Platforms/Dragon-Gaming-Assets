# Javatari 5.0.4 source

The browser bundle in the parent folder is copied from `release/stable/5.0/embedded/javatari.js` in https://github.com/ppeccin/javatari.js. The corresponding upstream JavaScript sources, image sources, build file, package manifests, README and AGPL-3 license are included here.

The hosted HTML wrapper is a local adaptation: it disables URL-parameter media loading and server keep-alives, and provides local-ROM/no-ROM-bundled instructions. The embedded emulator JavaScript was not modified. NetPlay remains an optional upstream feature; it is not needed for or used by local play.
