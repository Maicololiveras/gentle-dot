# Gentle Shell compatibility

Gentle Dot pins Gentle Shell (`gentle-pi`) 5.0.0 and the Pi SDK 1.6.0. Dot preserves the existing version-1 profile workflow metadata when managing model profiles. This is format compatibility, not a new UI control or permission to enable a delegation mode.

## Stored profiles

Gentle Shell keeps its version-1 profile format and may add:

```json
{
  "workflow": {
    "delegated": { "orchestratorMode": "full-delegation" }
  }
}
```

The name must identify a stored profile. Like the engine, Dot omits the default `organic` mode, invalid modes, and orphan workflow entries. Existing organic-only stores retain their previous shape.

Saving routes or applying another profile preserves existing workflow entries. Renaming or duplicating a profile carries its workflow metadata; deleting it removes that profile's entry. An import with identical routes but a different workflow mode is not an identical profile: it receives the normal collision suffix. Repeating that import does not duplicate it again or alter the source store.

## Packaged runtime

The published [Gentle Shell 5.0.0 distribution manifest](https://github.com/Gentleman-Programming/gentle-shell/releases/download/v5.0.0/gentle-shell-distribution.json) pins `@earendil-works/pi-coding-agent` 1.6.0. Dot matches that version in its direct Pi SDK dependencies and uses the same workspace lock to select the installed daemon's exact dependencies and Pi sibling overrides. The workspace and existing Windows and macOS CI jobs exempt only `gentle-pi@5.0.0` from the minimum release age.

Dot still launches the bundled `bin/gentle-shell.mjs` in RPC mode. It removes inherited `GENTLE_SHELL_INTERACTIVE_HOST` only for the recognized bundled default, in source checkouts and installed runtimes. Explicit `GENTLE_DOT_AGENT_BIN`, `GENTLE_DOT_AGENT_SCRIPT`, or `GENTLE_DOT_AGENT_ARGS` choices and other custom agents keep their environment. Installed Windows defaults still disable both launch-time provisioning paths; source and Unix provisioning settings are unchanged.

The installed layout and split-runtime behavior are unchanged: Windows still uses `bin/pi.cmd` and `node/bin/node.exe`, while Linux and macOS keep `bin/pi`. The Pi CLI entry is `@earendil-works/pi-coding-agent/dist/bundle/cli.js`. This update does not add the native Windows `pi.exe` wrapper, Go helper, or split startup changes.

## Verification boundaries

Run the source compatibility checks with Node.js 24, without installing dependencies, creating runtime artifacts, or launching an engine:

```sh
node --test --test-isolation=none scripts/windows/test/gentle-shell-compatibility.test.mjs
```

These checks cover manifest and runtime lock selection, exact minimum-age exclusions, and the environment passed to the installed bundled default and custom agents. They do not test a real package install or launcher. Daemon config and build tests additionally require the installed workspace dependencies; the Windows runtime build also requires the native stop addon.

Profile-format tests exercise synthetic profile files through the public profile store and format functions. They never migrate real user data or invoke a model. Windows POSIX mode-bit assertions must be distinguished from this format change using the unmodified base; they must not be skipped, weakened, or presented as passing.

Frozen dependency resolution, packaging the candidate runtime with Shell's package-local Gentle AI 5.0.0 companion, and native installed-runtime smoke tests remain separate release gates. The version pins alone do not establish runtime compatibility.
