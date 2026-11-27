import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { engramArchiveName, hostTarget, nodeArchiveName, parseMacArgs } from "../lib.mjs";

const macUsage = "usage: package-mac [--target <darwin-arm64|darwin-x64>] [--sign <identity>] [--skip-stage] [--check] [--check-dmg <dmg>] [--finder-layout]";
const repo = new URL("../../../", import.meta.url);

function rejected(script, args, message) {
	const runtime = new URL("build/runtime/", repo);
	const before = existsSync(runtime);
	const result = spawnSync(process.execPath, [fileURLToPath(new URL(`../${script}.mjs`, import.meta.url)), ...args], { encoding: "utf8", timeout: 10000 });
	assert.equal(result.error, undefined);
	assert.equal(result.status, 1);
	assert.equal(result.stdout, "");
	assert.equal(result.stderr, `${script}: ${message}\n`);
	assert.equal(existsSync(runtime), before);
}

test("Intel staging uses the native host and matching upstream archives", () => {
	assert.equal(hostTarget("darwin", "x64"), "darwin-x64");
	assert.equal(nodeArchiveName("24.14.1", "darwin-x64"), "node-v24.14.1-darwin-x64.tar.gz");
	assert.equal(engramArchiveName("3.4.0", "darwin-x64"), "engram_3.4.0_darwin_amd64.tar.gz");
	assert.equal(parseMacArgs(["--target", "darwin-x64"], {}).target, "darwin-x64");
});

test("invalid macOS target selectors fail before staging or native tooling", () => {
	rejected("package-mac", ["--target"], `Unexpected argument --target.\n${macUsage}`);
	rejected("package-mac", ["--target", "linux-x64"], "Unknown macOS target linux-x64; expected darwin-arm64 or darwin-x64.");
	rejected("package-mac", ["--target", "darwin-arm64", "--target", "darwin-x64"], "--target may be specified only once.");
});

test("a repeated stage target cannot silently select the new Intel profile", () => {
	for (const targets of [["darwin-arm64", "darwin-x64"], ["darwin-x64", "darwin-arm64"]]) {
		rejected("stage-runtime", ["--target", targets[0], "--target", targets[1], "--engram-version", "invalid"], "--target may be specified only once when selecting darwin-x64.");
	}
	rejected("stage-runtime", ["--target", "linux-arm64", "--target", "linux-x64", "--engram-version", "invalid"], "--engram-version must be x.y.z, got invalid.");
});

test("macOS packaging defaults to ARM and rejects cross-host builds", () => {
	const host = hostTarget() ?? `${process.platform}-${process.arch}`;
	const mismatch = (target) => `Cannot stage ${target} on ${host}: the runtime's dependencies include native pieces for the machine that installs them. Stage ${target} on a ${target} machine or container (Linux targets are staged inside a container).`;
	if (host !== "darwin-arm64") rejected("package-mac", ["--skip-stage"], mismatch("darwin-arm64"));
	if (host !== "darwin-x64") {
		rejected("package-mac", ["--target", "darwin-x64", "--skip-stage"], mismatch("darwin-x64"));
		rejected("stage-runtime", ["--target", "darwin-x64"], mismatch("darwin-x64"));
	}
});

test("QA workflow builds and checks the four POSIX profiles before uploading artifacts", () => {
	const workflow = new URL(".github/workflows/native-packages.yml", repo);
	assert.ok(existsSync(workflow), "missing Native package QA workflow");
	const source = readFileSync(workflow, "utf8");
	assert.match(source, /branches: \[ci\/qa275-04-artifacts, qa\/native-preview\]/);
	assert.match(source, /permissions:\s+contents: read/);
	assert.match(source, /arch: amd64\s+runner: ubuntu-24\.04\s+distributions: debian,ubuntu,arch/);
	assert.match(source, /arch: arm64\s+runner: ubuntu-24\.04-arm\s+distributions: debian,ubuntu/);
	assert.match(source, /target: darwin-arm64\s+runner: macos-15\s+bundle: target\/release\/bundle\/dmg/);
	assert.match(source, /target: darwin-x64\s+runner: macos-15-intel\s+bundle: target\/x86_64-apple-darwin\/release\/bundle\/dmg/);
	assert.match(source, /package-linux\.mjs[\s\S]*linux-check\.mjs[\s\S]*sha256sum[\s\S]*upload-artifact/);
	assert.match(source, /package-mac\.mjs[^\n]*--sign - --check[\s\S]*shasum -a 256[\s\S]*upload-artifact/);
	assert.doesNotMatch(source, /pull_request|\btags:|contents: write|gh release|action-gh-release/);
});
