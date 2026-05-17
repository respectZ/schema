import path from "path/posix";
import { createSchema, writeJson } from "../utils";
import { generateClientPaths } from "./client";
import { generateClientIdentifiers } from "./client/identifiers";
import { generateClientLang } from "./client/lang";

const entries: Entry[] = [
	{
		filepath: "vanilla/client/paths.json",
		content: async () => {
			const { texturePaths, soundPaths } = await generateClientPaths();
			return {
				$defs: {
					texture_path: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: texturePaths,
							},
						],
					},
					sound_path: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: soundPaths,
							},
						],
					},
				},
			};
		},
	},
	{
		filepath: "vanilla/client/identifiers.json",
		content: async () => {
			const { particleIdentifiers, soundEventIdentifiers, soundIdentifiers } =
				await generateClientIdentifiers();
			return {
				$defs: {
					particle_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: particleIdentifiers,
							},
						],
					},
					sound_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: soundIdentifiers,
							},
						],
					},
					sound_event_identifier: {
						enum: soundEventIdentifiers.events,
					},
					block_sound_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: soundEventIdentifiers.blocks,
							},
						],
					},
				},
			};
		},
	},
	{
		filepath: "vanilla/client/lang_keys.json",
		content: async () => {
			const { langKeys } = await generateClientLang();
			return {
				anyOf: [
					{
						type: "string",
					},
					{
						enum: langKeys,
					},
				],
			};
		},
	},
];

async function main() {
	for (const entry of entries) {
		const dest = path.join("schema", entry.filepath);
		const schema = createSchema(dest);
		console.log(`Generating schema for ${entry.filepath}...`);
		const content = await entry.content();
		Object.assign(schema, content);
		console.log(`Writing schema to ${dest}...`);
		await writeJson(dest, schema);
	}
}

await main();

type Entry = {
	filepath: string;
	content: () => Promise<Record<string, unknown>>;
};
