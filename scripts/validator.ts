import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { readJson } from "./utils";

interface RefIssue {
	schema: string;
	ref: string;
	resolved: string;
	kind: "missing" | "fragment";
}

function collectRefs(value: unknown, refs: string[]): void {
	if (value === null || typeof value !== "object") return;
	if (Array.isArray(value)) {
		for (const item of value) collectRefs(item, refs);
		return;
	}
	const obj = value as Record<string, unknown>;
	if (typeof obj.$ref === "string") refs.push(obj.$ref);
	for (const key of Object.keys(obj)) {
		if (key === "$ref") continue;
		collectRefs(obj[key], refs);
	}
}

function resolveRef(ref: string, fromFile: string): { path: string; fragment?: string } {
	const hashIndex = ref.indexOf("#");
	const pathPart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
	const fragment = hashIndex === -1 ? undefined : ref.slice(hashIndex + 1);
	if (pathPart === "") return { path: fromFile, fragment };
	if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(pathPart)) return { path: pathPart, fragment };
	if (isAbsolute(pathPart)) return { path: pathPart, fragment };
	if (pathPart.startsWith("schema/")) return { path: pathPart, fragment };
	return { path: resolve(dirname(fromFile), pathPart), fragment };
}

function resolvePointer(value: unknown, fragment: string): boolean {
	let decoded: string;
	try {
		decoded = decodeURIComponent(fragment);
	} catch {
		return false;
	}
	if (decoded === "") return true;
	if (!decoded.startsWith("/")) return findAnchor(value, decoded);
	let current = value;
	for (const rawPart of decoded.slice(1).split("/")) {
		const part = rawPart.replace(/~1/g, "/").replace(/~0/g, "~");
		if (current === null || typeof current !== "object") return false;
		if (!Object.prototype.hasOwnProperty.call(current, part)) return false;
		current = (current as Record<string, unknown>)[part];
	}
	return true;
}

function findAnchor(value: unknown, anchor: string): boolean {
	if (value === null || typeof value !== "object") return false;
	if (Array.isArray(value)) return value.some((item) => findAnchor(item, anchor));
	const obj = value as Record<string, unknown>;
	if (obj.$anchor === anchor || obj.$dynamicAnchor === anchor || obj.$id === `#${anchor}`)
		return true;
	return Object.values(obj).some((item) => findAnchor(item, anchor));
}

async function main() {
	const root = "schema";
	const issues: RefIssue[] = [];
	const seen = new Set<string>();
	const parsedFiles = new Map<string, unknown>();
	let fileCount = 0;
	for await (const entry of new Bun.Glob(join(root, "**/*.json")).scan()) {
		const file = entry.replace(/\\/g, "/");
		let schema: unknown;
		try {
			schema = await readJson(file);
		} catch {
			continue;
		}
		fileCount++;

		const refs: string[] = [];
		collectRefs(schema, refs);

		for (const ref of refs) {
			const key = `${file}::${ref}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const resolved = resolveRef(ref, file);
			if (resolved.path.startsWith("http://") || resolved.path.startsWith("https://")) continue;
			if (!existsSync(resolved.path)) {
				issues.push({ schema: file, ref, resolved: resolved.path, kind: "missing" });
				continue;
			}
			if (resolved.fragment !== undefined && resolved.fragment !== "") {
				let target = parsedFiles.get(resolved.path);
				if (target === undefined) {
					try {
						target = await readJson(resolved.path);
						parsedFiles.set(resolved.path, target);
					} catch {
						continue;
					}
				}
				if (!resolvePointer(target, resolved.fragment)) {
					issues.push({ schema: file, ref, resolved: resolved.path, kind: "fragment" });
				}
			}
		}
	}

	if (issues.length === 0) {
		console.log(`Validated ${seen.size} unique $ref references across ${fileCount} files.`);
		process.exit(0);
	}

	for (const i of issues) {
		console.log(`${i.kind === "missing" ? "MISSING" : "INVALID FRAGMENT"}: ${i.ref}`);
		console.log(`  in:       ${i.schema}`);
		console.log(`  resolved: ${i.resolved}`);
	}

	console.error(`\n${issues.length} missing $ref target(s).`);
	process.exit(1);
}

await main();
