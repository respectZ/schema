import { MinecraftEffectTypes } from "@minecraft/vanilla-data";
import path from "node:path/posix";
import { readJson } from "../../utils";

function visitFragments(json: unknown, fragments: Array<string | number>): unknown {
	let current = json;
	for (const fragment of fragments) {
		if (typeof current !== "object" || current === null) {
			return undefined;
		}
		current = (current as Record<string, unknown>)[fragment];
	}
	return current;
}

async function isDeprecatedComponent(filepath: string): Promise<boolean> {
	const json = await readJson<Record<string, boolean>>(filepath);
	if (!json) {
		return false;
	}
	return json.deprecated === true;
}

function* getEffectComponents() {
	for (const value of Object.values(MinecraftEffectTypes)) {
		const id = value.split(":")[1];
		yield `minecraft:effect.${id}`;
	}
}

export async function generateServerEntityComponents() {
	const pattern = "schema/bedrock/server/entity/*";
	let latest: string | undefined;
	let cwd: string = "";
	for await (let dirpath of new Bun.Glob(pattern).scan({ onlyFiles: false })) {
		dirpath = dirpath.replace(/\\/g, "/");
		const version = path.basename(dirpath);
		if (version === "legacy" || version.endsWith(".json")) {
			continue;
		}
		if (!latest) {
			latest = version;
		} else {
			if (Bun.semver.order(version, latest) === 1) {
				latest = version;
			}
		}
	}

	if (!latest) {
		throw new Error("No valid entity component version found.");
	}

	const dir = path.dirname(pattern);
	cwd = dir;
	const actorDocumentPath = path.join(cwd, latest, "_index.json");
	const actorDocument = await readJson(actorDocumentPath);
	const componentFragments = [
		["properties", "minecraft:entity", "properties", "components", "allOf", 0],
		["properties", "minecraft:entity", "properties", "components", "allOf", 1],
	];
	const components: string[] = [];
	for (const fragments of componentFragments) {
		cwd = path.join(dir, latest);
		const node = visitFragments(actorDocument, fragments);
		const refPath = path.join(cwd, (node as Record<string, string>)["$ref"]);
		cwd = path.dirname(refPath);
		const componentsIndex = await readJson<ComponentSchema>(refPath);
		// We need to filter out deprecated components
		// as mostly all of them aren't counted as valid components anymore.
		for (const key of Object.keys(componentsIndex.properties)) {
			const relativePath = componentsIndex.properties[key]["$ref"];
			const componentPath = path.join(cwd, relativePath);
			if (!(await isDeprecatedComponent(componentPath))) {
				components.push(key);
			}
		}
	}

	for (const effectComponent of getEffectComponents()) {
		components.push(effectComponent);
	}
	return components;
}

type ComponentSchema = {
	properties: Record<string, { $ref: string }>;
};
