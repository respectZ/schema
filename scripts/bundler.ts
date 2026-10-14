import path from "node:path/posix";
import type { Schema } from "./types";
import { normalizePath, readJson } from "./utils";

class SchemaVisitor {
	private static readonly SCHEMA_MAPS = [
		"$defs",
		"definitions",
		"properties",
		"patternProperties",
		"dependencies",
		"dependentSchemas",
	];
	private static readonly SCHEMA_VALUES = [
		"items",
		"additionalItems",
		"additionalProperties",
		"contains",
		"not",
		"if",
		"then",
		"else",
		"propertyNames",
		"unevaluatedItems",
		"unevaluatedProperties",
		"contentSchema",
		"allOf",
		"anyOf",
		"oneOf",
		"prefixItems",
	];
	visitedSchemas: Set<Schema> = new Set();
	constructor(private visit: (node: Schema, pointer: string) => void) {}

	private isObject(value: unknown): value is Record<string, unknown> {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}

	visitSchema(schema: Schema, pointer: string = "") {
		if (this.visitedSchemas.has(schema)) {
			return;
		}
		this.visitedSchemas.add(schema);
		this.visit(schema, pointer);
		for (const key of SchemaVisitor.SCHEMA_MAPS) {
			const schemas = schema[key as keyof Schema];
			if (this.isObject(schemas)) {
				for (const [subKey, subSchema] of Object.entries(schemas)) {
					this.visitSchema(subSchema as Schema, `${pointer}/${key}/${subKey}`);
				}
			}
		}
		for (const key of SchemaVisitor.SCHEMA_VALUES) {
			const subSchema = schema[key as keyof Schema];
			if (this.isObject(subSchema)) {
				this.visitSchema(subSchema as Schema, `${pointer}/${key}`);
			} else if (Array.isArray(subSchema)) {
				subSchema.forEach((item, index) => {
					if (this.isObject(item)) {
						this.visitSchema(item as Schema, `${pointer}/${key}/${index}`);
					}
				});
			}
		}
	}
}

function resolveJsonPath(json: unknown, pointer: string): unknown {
	const fragments = pointer.split("/");
	let current = json;
	for (let fragment of fragments) {
		if (fragment === "") {
			continue;
		}
		fragment = fragment.replace(/~1/g, "/").replace(/~0/g, "~");
		fragment = decodeURIComponent(fragment);
		if (current === null || typeof current !== "object") {
			throw new Error(`Invalid JSON pointer: ${pointer}`);
		}
		if (Array.isArray(current)) {
			const number = Number(fragment);
			if (isNaN(number) || number < 0 || number >= current.length) {
				throw new Error(`Invalid array index in JSON pointer: ${pointer}`);
			}
			current = current[number];
		} else {
			if (!(fragment in current)) {
				throw new Error(`Property not found in JSON pointer: ${pointer}`);
			}
			current = (current as Record<string, unknown>)[fragment];
		}
	}
	return current;
}

function stripSchemaKeys(schema: Schema | boolean) {
	if (typeof schema !== "object" || schema === null) {
		return;
	}
	const keys = ["$schema"];
	for (const key of keys) {
		if (key in schema) {
			delete schema[key as keyof Schema];
		}
	}
}

export async function bundleSchema(entryPoint: string): Promise<Schema> {
	entryPoint = path.join(normalizePath(entryPoint));
	const documents = new Map<string, Schema>();

	const loadSchema = async (filepath: string): Promise<Schema> => {
		if (documents.has(filepath)) {
			return documents.get(filepath)!;
		}
		const schema = await readJson<Schema>(filepath);
		documents.set(filepath, schema);
		return schema;
	};

	type BundledReference = {
		key: string;
		content: unknown;
	};
	const hashedRefs: Map<string, BundledReference> = new Map();
	const setRefs = new Set<string>();
	const rootSchema = await loadSchema(entryPoint);
	rootSchema.$defs = rootSchema.$defs || {};

	for (const [filepath, schema] of documents) {
		const references: Schema[] = [];
		const visitor = new SchemaVisitor((node) => {
			if (typeof node.$ref === "string") {
				references.push(node);
			}
		});
		visitor.visitSchema(schema);

		for (const node of references) {
			const ref = node.$ref!;
			const hash = ref.indexOf("#");
			const pathname = hash === -1 ? ref : ref.slice(0, hash);
			const fragment = hash === -1 ? "" : ref.slice(hash + 1);
			const targetPath = pathname ? path.join(path.dirname(filepath), pathname) : filepath;
			const fullRef = targetPath + fragment;
			if (hashedRefs.has(fullRef)) {
				node.$ref = `#/$defs/${hashedRefs.get(fullRef)!.key}`;
				continue;
			}

			const targetSchema = await loadSchema(targetPath);
			// If the reference is to the root schema itself, we can skip it
			if (ref === "#" && targetPath === entryPoint) {
				continue;
			}
			// Reference it's own json by path
			if (path.join(ref) === entryPoint) {
				node.$ref = "#";
				continue;
			}

			const pointer = fragment ? `#${fragment}` : "";
			const key = Bun.hash(fullRef).toString(36);
			if (pointer) {
				const json = resolveJsonPath(targetSchema, pointer.slice(1));
				hashedRefs.set(fullRef, { key, content: json });
			} else {
				hashedRefs.set(fullRef, { key, content: targetSchema });
			}
			node.$ref = `#/$defs/${key}`;
			setRefs.add(key);
		}
	}

	rootSchema.$defs = {};
	for (const [, { key, content }] of hashedRefs) {
		stripSchemaKeys(content as Schema);
		rootSchema.$defs![key] = content as Schema;
	}

	// Unoptimized cleanup?
	const visitor = new SchemaVisitor((node) => {
		if (node.$defs) {
			for (const key of Object.keys(node.$defs)) {
				if (!setRefs.has(key)) {
					delete node.$defs[key];
				}
			}
			if (Object.keys(node.$defs).length === 0) {
				delete node.$defs;
			}
		}
	});
	visitor.visitSchema(rootSchema);

	return rootSchema;
}
