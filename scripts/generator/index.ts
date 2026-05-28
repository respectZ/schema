import {
	MinecraftBiomeTypes,
	MinecraftBlockTypes,
	MinecraftEnchantmentTypes,
	MinecraftEntityTypes,
	MinecraftItemTypes,
} from "@minecraft/vanilla-data";
import path from "path/posix";
import { createSchema, readJson, writeJson } from "../utils";
import { generateClientPaths } from "./client";
import { generateClientIdentifiers } from "./client/identifiers";
import { generateClientLang } from "./client/lang";
import { generateServerBiomeTag, generateServerTypeFamily } from "./server";

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
			const biomeIdentifiers = Object.values(MinecraftBiomeTypes);
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
					biome_identifier: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: biomeIdentifiers,
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
	{
		filepath: "vanilla/server/enchantment.json",
		content: async () => {
			const enchantments = Object.values(MinecraftEnchantmentTypes).map((enchantment) =>
				enchantment.replace("minecraft:", ""),
			);
			return {
				anyOf: [
					{
						type: "string",
						maxLength: 256,
					},
					{
						enum: enchantments,
					},
				],
			};
		},
	},
	{
		filepath: "vanilla/server/tags.json",
		load: true,
		content: async (json) => {
			const biomeTags = await generateServerBiomeTag();
			json["$defs"]["biome_tag"] = {
				anyOf: [
					{
						type: "string",
						maxLength: 256,
					},
					{
						enum: biomeTags,
					},
				],
			};
			return json;
		},
	},
];

async function main() {
	for (const entry of entries) {
		const dest = path.join("schema", entry.filepath);
		let schema: Record<string, unknown>;
		let content: Record<string, unknown>;
		if (isAddition(entry)) {
			schema = await readJson(dest);
			content = await entry.content(schema);
		} else {
			schema = createSchema(dest);
			content = await entry.content();
		}
		console.log(`Generating schema for ${entry.filepath}...`);
		Object.assign(schema, content);
		console.log(`Writing schema to ${dest}...`);
		await writeJson(dest, schema);
	}
}

const isAddition = (entry: Entry): entry is EntryAddition => "load" in entry && entry.load === true;

await main();

type Entry =
	| {
			filepath: string;
			content: () => Promise<Record<string, unknown>>;
	  }
	| EntryAddition;

type EntryAddition = {
	filepath: string;
	load: true;
	content: (json: Record<string, any>) => Promise<Record<string, unknown>>;
};
