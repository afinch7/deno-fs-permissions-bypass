# deno-fs-permissions-bypass
Just a proof of concept for a security issue in deno.

This includes slightly modified code from deno, base64-js, and flatbuffers.

usage is just like std/examples/cat.ts example: `deno read-any-file.ts test.txt`

The key difference here is that deno won't ask for permission before allowing this read.
