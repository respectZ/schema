import {
	MinecraftBlockTypes,
	MinecraftEntityTypes,
	MinecraftItemTypes,
} from "@minecraft/vanilla-data";
import path from "path/posix";
import { createSchema, writeJson } from "../utils";
import { generateClientPaths } from "./client";
import { generateClientIdentifiers } from "./client/identifiers";
import { generateClientLang } from "./client/lang";
import { generateServerTypeFamily } from "./server";

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
			const {
				particleIdentifiers,
				soundEventIdentifiers,
				individualNamedSoundIdentifiers,
				soundIdentifiers,
				terrainTextureIdentifiers,
				materialIdentifiers,
				geometryIdentifiers,
				animationControllerIdentifiers,
				animationIdentifiers,
				renderControllerIdentifiers,
				itemTextureIdentifiers,
				fogIdentifiers,
				atmosphereIdentifiers,
				colorGradingIdentifiers,
				lightingIdentifiers,
				waterIdentifiers,
			} = await generateClientIdentifiers();
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
					individual_named_sound_identifier: {
						enum: individualNamedSoundIdentifiers,
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
					terrain_texture_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: terrainTextureIdentifiers,
							},
						],
					},
					material_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: materialIdentifiers,
							},
						],
					},
					geometry_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: geometryIdentifiers,
							},
						],
					},
					animation_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: animationIdentifiers.concat(animationControllerIdentifiers),
							},
						],
					},
					animation_controller_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: animationControllerIdentifiers,
							},
						],
					},
					render_controller_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: renderControllerIdentifiers,
							},
						],
					},
					item_texture_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: itemTextureIdentifiers,
							},
						],
					},
					fog_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: fogIdentifiers,
							},
						],
					},
					atmosphere_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: atmosphereIdentifiers,
							},
						],
					},
					color_grading_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: colorGradingIdentifiers,
							},
						],
					},
					lighting_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: lightingIdentifiers,
							},
						],
					},
					water_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: waterIdentifiers,
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
	{
		filepath: "vanilla/server/identifiers.json",
		content: async () => {
			const blockIdentifiers = Object.values(MinecraftBlockTypes);
			const itemIdentifiers = Object.values(MinecraftItemTypes);
			const entityIdentifiers = Object.values(MinecraftEntityTypes);
			return {
				$defs: {
					block_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: blockIdentifiers,
							},
						],
					},
					item_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: itemIdentifiers,
							},
						],
					},
					entity_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: entityIdentifiers,
							},
						],
					},
				},
			};
		},
	},
	{
		filepath: "vanilla/server/type_family.json",
		content: async () => {
			const typeFamily = await generateServerTypeFamily();
			return {
				anyOf: [
					{
						type: "string",
						maxLength: 256,
					},
					{
						enum: typeFamily,
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
