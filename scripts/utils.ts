import type { RootSchema } from "./types";
import path from "path/posix";
import JSONC from "tiny-jsonc";
import prettier from "prettier";

/**
 * Creates a JSON schema with the given filepath as the $id and the standard $schema URL.
 * @param filepath
 * @returns A JSON schema object
 * @example
 * createSchema("schema/vanilla/client/paths.json") returns
 * {
 *   $schema: "https://json-schema.org/draft/2020-12/schema",
 *   $id: "schema/vanilla/client/paths.json"
 * }
 */
export function createSchema(filepath: string): RootSchema {
	return {
		$schema: "https://json-schema.org/draft/2020-12/schema",
		$id: filepath,
	};
}

async function getPrettierConfig() {
	const config = await prettier.resolveConfig("./.prettierrc");
	if (!config) {
		throw new Error("Prettier configuration not found");
	}
	return config;
}

export async function readJson<T>(filepath: string): Promise<T> {
	return JSONC.parse(await Bun.file(filepath).text()) as T;
}

export async function writeJson(filepath: string, data: unknown): Promise<void> {
	const file = Bun.file(filepath);
	const formatted = await prettier.format(JSON.stringify(data), {
		parser: "json",
		...(await getPrettierConfig()),
	});
	await file.write(formatted);
}

export function getEnv(key: "BEDROCK_PATH"): string {
	const value = Bun.env[key];
	if (!value) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

function bedrockPath(type: "bp" | "rp") {
	const bedrockPath = getEnv("BEDROCK_PATH");
	return path.join(bedrockPath, type === "bp" ? "behavior_pack" : "resource_pack");
}

export async function getBedrockFiles(options: GetBedrockFilesOptions): Promise<string[]> {
	const { pattern, type, extension, relative, sort, transform } = options;
	const searchPath = bedrockPath(type);
	const glob = new Bun.Glob(path.join(searchPath, pattern));
	const files: string[] = [];
	for await (let file of glob.scan({ onlyFiles: true })) {
		file = file.replace(/\\/g, "/");
		if (!extension) {
			file = file.split(".").slice(0, -1).join(".");
		}
		if (relative) {
			file = path.relative(searchPath, file);
		}
		files.push(transform ? transform(file) : file);
	}
	if (sort) {
		files.sort();
	}
	return files;
}

export async function getBedrockJSON<T, U = string>(
	options: GetBedrockJSONContentOptions<T, U>,
): Promise<U[]> {
	const { pattern, type } = options;
	const glob = new Bun.Glob(path.join(bedrockPath(type), pattern));
	console.log(path.join(bedrockPath(type), pattern));
	const results: U[] = [];
	for await (let file of glob.scan({ onlyFiles: true })) {
		const content = await readJson<T>(file);
		results.push(options.transform(content));
	}
	return results;
}

export type GetBedrockFilesOptions = {
	type: "bp" | "rp";
	pattern: string;
	extension?: boolean;
	relative?: boolean;
	sort?: boolean;
	transform?: (filepath: string) => string;
};

export type GetBedrockJSONContentOptions<T, U> = {
	type: "bp" | "rp";
	pattern: string;
	transform: (content: T) => U;
};
