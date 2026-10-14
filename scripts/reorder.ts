import { readJson, writeJson } from "./utils";

/**
 * Canonical sibling-key order for JSON Schema objects.
 * Keys not in this list keep their original relative order and are appended after known ones.
 * Reflects the house style observed across schema/ (e.g. title, description, type).
 */
const KEY_ORDER = [
	"$schema",
	"$id",
	"$comment",
	"$ref",
	"title",
	"description",
	"deprecated",
	"type",
	"enum",
	"const",
	"default",
	"examples",
	"required",
	"additionalProperties",
	"unevaluatedProperties",
	"propertyNames",
	"properties",
	"patternProperties",
	"prefixItems",
	"items",
	"allOf",
	"anyOf",
	"oneOf",
	"not",
	"if",
	"then",
	"else",
	"minimum",
	"maximum",
	"exclusiveMinimum",
	"exclusiveMaximum",
	"multipleOf",
	"minLength",
	"maxLength",
	"pattern",
	"minItems",
	"maxItems",
	"uniqueItems",
	"minProperties",
	"maxProperties",
	"$defs",
] as const;

const KEY_RANK = new Map<string, number>(KEY_ORDER.map((key, index) => [key, index]));

/**
 * Keys whose own key set is semantic (a name -> schema map) and must be preserved as-is.
 * The values under these keys still recurse into reordering.
 */
const SEMANTIC_MAP_KEYS = new Set(["properties", "patternProperties", "$defs"]);

/**
 * Deeply reorders the sibling keys of every object according to KEY_ORDER.
 * Preserves the key order of semantic name->schema maps (properties, patternProperties, $defs)
 * and the element order of every array. Values are never changed.
 */
export function reorder(value: unknown, parentKey?: string): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => reorder(item, parentKey));
	}
	if (value === null || typeof value !== "object") {
		return value;
	}

	const obj = value as Record<string, unknown>;
	const entries = Object.entries(obj);

	// Recurse into every value first (child key sets may need reordering).
	const processed = new Map(entries.map(([key, val]) => [key, reorder(val, key)]));

	// Preserve the key set when this object is itself a semantic name->schema map.
	if (parentKey && SEMANTIC_MAP_KEYS.has(parentKey)) {
		return Object.fromEntries(processed);
	}

	const known = new Set<string>();
	const unknown: [string, unknown][] = [];
	for (const key of processed.keys()) {
		if (KEY_RANK.has(key)) known.add(key);
		else unknown.push([key, processed.get(key)]);
	}

	const ordered: [string, unknown][] = [];
	for (const key of KEY_ORDER) {
		if (known.has(key)) {
			ordered.push([key, processed.get(key)]);
		}
	}
	ordered.push(...unknown);

	return Object.fromEntries(ordered);
}

function parseArgs(argv: string[]): { dryRun: boolean } {
	const dryRun = argv.includes("--dry-run") || argv.includes("--check");
	return { dryRun };
}

async function main() {
	const { dryRun } = parseArgs(process.argv.slice(2));

	let reordered = 0;
	let unchanged = 0;
	let skipped = 0;

	for await (const entry of new Bun.Glob("schema/**/*.json").scan()) {
		const filepath = entry.replace(/\\/g, "/");
		let before: unknown;
		try {
			before = await readJson<unknown>(filepath);
		} catch {
			// Skip files that fail to parse (e.g. corrupted content); leave them untouched.
			console.warn(`SKIP (unparseable): ${filepath}`);
			skipped++;
			continue;
		}
		const after = reorder(before);

		if (JSON.stringify(before) === JSON.stringify(after)) {
			unchanged++;
			continue;
		}

		reordered++;
		if (dryRun) {
			console.log(`CHANGED: ${filepath}`);
			continue;
		}
		await writeJson(filepath, after);
	}

	if (dryRun) {
		console.log(`\nWould reorder: ${reordered}`);
		console.log(`Unchanged:     ${unchanged}`);
		console.log(`Skipped:       ${skipped}`);
		process.exit(reordered > 0 ? 1 : 0);
	}

	console.log(`Reordered: ${reordered}`);
	console.log(`Unchanged: ${unchanged}`);
	console.log(`Skipped:   ${skipped}`);
}

if (import.meta.main) {
	await main();
}
