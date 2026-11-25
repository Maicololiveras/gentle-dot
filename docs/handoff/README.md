# Windows split-runtime checkpoint

This is a source handoff for `Maicololiveras/gentle-dot`, not an installer or a merge candidate. The patch is stored as data on a branch based on upstream `main`; the changes are not applied to that branch.

- [Windows split patch](windows-split-6212d2e-f5bc5ca.patch): exact committed source, tests, docs and lockfile changes from `6212d2eca9600fb698355e662ab84ee169a34b4e` to `f5bc5ca42c234aef02dacfd9189c6681f3638749`, excluding task journals. No binaries, generated build output or uncommitted files.
- Patch SHA-256: `8e269881365c52cd5c3b41a6630baa6ee4d0a98b20c66302b136cb2329607cae`. Applying it to the exact historical base was checked in an isolated Git index; the selected paths matched the final commit byte-for-byte. This does not establish compatibility with current `main`.
- The local Windows bridge passed 15 affected ordinary tests and 13 opt-in fixture tests, including two inert process cases. The full unfiltered test suite and a production runtime launch were not verified.

## Resume in this order

1. Port the source changes to current `main` on a separate review branch; do not apply this patch blindly. Direct application of the split slice did not match `Cargo.toml` and `daemon/windows.rs` on the upstream baseline.
2. Wire the fixed private runtime root and state provisioning. Obtain independent provenance for the exact production payload before enabling the runtime pin.
3. Build and verify the NSIS. In an offline standard-user Windows Sandbox with a fresh profile, confirm the owned daemon starts, ChatGPT appears in Accounts without sign-in, and shutdown leaves no owned process.
4. Serve only that accepted installer through the local download page. See the [native CI backlog](../fork-ci-backlog.md) for other systems.
