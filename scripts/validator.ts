import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { readJson } from "./utils";

interface RefIssue {
	schema: string;
	ref: string;
	resolved: string;
	kind: "missing";
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

function resolveRef(ref: string, fromFile: string): string {
	const hashIndex = ref.indexOf("#");
	const pathPart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
	if (pathPart === "") return fromFile;
	if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(pathPart)) return pathPart;
	if (isAbsolute(pathPart)) return pathPart;
	if (pathPart.startsWith("schema/")) return pathPart;
	return resolve(dirname(fromFile), pathPart);
}

async function main() {
	const root = "schema";
	const issues: RefIssue[] = [];
	const seen = new Set<string>();
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
			if (resolved.startsWith("http://") || resolved.startsWith("https://")) continue;
			if (!existsSync(resolved)) {
				issues.push({ schema: file, ref, resolved, kind: "missing" });
			}
		}
	}

	if (issues.length === 0) {
		console.log(`Validated ${seen.size} unique $ref references across ${fileCount} files.`);
		process.exit(0);
	}

	for (const i of issues) {
		console.log(`MISSING: ${i.ref}`);
		console.log(`  in:       ${i.schema}`);
		console.log(`  resolved: ${i.resolved}`);
	}

	console.error(`\n${issues.length} missing $ref target(s).`);
	process.exit(1);
}

await main();
