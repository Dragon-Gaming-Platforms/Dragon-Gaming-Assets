# JS Playground

An original, dependency-free JavaScript playground. Each run executes in a fresh `<iframe sandbox="allow-scripts">` with an opaque origin, no same-origin permission, and a restrictive Content Security Policy that blocks network connections, external resources, forms, popups and nested frames. The parent UI receives only text console messages from that iframe. User code has a small DOM preview and a console, but cannot access the parent document or storage.

Code is stored in the editor only and is not uploaded. No libraries, packages, `eval` service, or backend are used. As with any in-browser code runner, a tight infinite synchronous loop can temporarily make the tab unresponsive; the tool warns before running user code.

## License

MIT; see `LICENSE`. All wrapper code and snippets are original project work.
