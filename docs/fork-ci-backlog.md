# Fork backlog: native CI and installer acceptance

This is the handoff for Windows, macOS and Linux. This branch only records tasks. It does not change workflows, run CI, or make an installer available. Keep QA artifacts separate from releases.

## Where the local changes stand

- Upstream baseline: `f97d56d884b1d3c178f415b95d486464e7b220bf` (`Gentleman-Programming/gentle-dot`, `main`).
- The workstation branch `feat/dot-shell5-windows-integration` at `c52a492` contains the Shell 5.0.0 / Pi 1.6.0 integration, Windows provider ownership and verified split-runtime work. It is not included in this documentation branch.
- The verified local split-runtime range `118cf12..c52a492` does not apply directly to this upstream baseline: `apps/desktop/src-tauri/Cargo.toml` and `apps/desktop/src-tauri/src/daemon/windows.rs` need integration. Port that work in scoped changes rather than copying the workstation branch, generated files or unrelated CI history.
- A local frontend build and a Windows x64 diagnostic executable were verified. That executable deliberately refuses to start without a trusted runtime. It is not a working installer or an Accounts acceptance result.

## Tasks

| Task | Work | Acceptance |
| --- | --- | --- |
| CI-1 · Define the native CI matrix | Choose supported OS/architecture pairs and native runners. Review the existing [Windows](../.github/workflows/windows.yml), [macOS](../.github/workflows/macos.yml), and [POSIX](../.github/workflows/posix.yml) workflows before adding QA jobs. | Every supported target names its runner, architecture, and checks. Unsupported and untested targets are explicit. |
| CI-2 · Produce a trusted Windows x64 runtime | Freeze the Shell/Pi runtime inputs. Emit and independently verify an inventory with path, type, size, and SHA-256 per file. Tie it to the producer revision, target, lock and payload. | The full runtime and installer inputs match the authenticated inventory. The previously refused NSIS is not reused. |
| CI-3 · Qualify the Windows x64 installer | Port the split-runtime changes, complete private runtime launch and verify the exact current-user NSIS. Follow [Windows testing](windows-testing.md) and run an offline Windows Sandbox with a fresh standard-user profile. | The owned daemon is ready, ChatGPT appears in Accounts without sign-in, and shutdown leaves no owned processes running. |
| CI-4 · Qualify macOS installers | Build and launch on each selected native macOS architecture; see [installation](install.md). Check the signing and notarization status independently. | Installer hashes, actual first-run evidence and signing status are recorded per target. |
| CI-5 · Qualify Linux packages | Follow [Linux testing](linux-testing.md). Build and test install, start, stop and removal on each supported distribution. Separate desktop-session tests from headless tests. | Each target has an artifact hash and clean lifecycle evidence; skipped checks are visible. |
| CI-6 · Hand off local download | After exact Windows acceptance, serve only the tested NSIS on loopback and verify the HTTP download against its accepted SHA-256. | The local page serves the accepted bytes, and the owner has the test instructions. No public releases are made by this task. |

Preserve existing profiles and credentials. For every QA handoff, record the source revision, runner and toolchain, run URL, artifact hash, and what actually ran. A successful build does not prove an installed launch.
