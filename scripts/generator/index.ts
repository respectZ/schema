import {
	MinecraftBiomeTypes,
	MinecraftBlockTypes,
	MinecraftCameraPresetsTypes,
	MinecraftEffectTypes,
	MinecraftEnchantmentTypes,
	MinecraftEntityTypes,
	MinecraftItemTypes,
} from "@minecraft/vanilla-data";
import path from "path/posix";
import { createSchema, readJson, writeJson } from "../utils";
import { generateClientPaths } from "./client";
import { generateClientIdentifiers } from "./client/identifiers";
import { generateClientLang } from "./client/lang";
import {
	generateCommandEnum,
	generateServerBiomeTag,
	generateServerPaths,
	generateServerTypeFamily,
} from "./server";
import { generateServerBlockStates } from "./server/block_states";

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
	{
		filepath: "vanilla/server/gamerule.json",
		content: async () => {
			const { gameRules } = await generateCommandEnum();
			return {
				enum: gameRules,
			};
		},
	},
	{
		filepath: "vanilla/server/effect_type.json",
		content: async () => {
			const effectTypes = Object.values(MinecraftEffectTypes).map((effect) =>
				effect.replace("minecraft:", ""),
			);
			return {
				enum: effectTypes,
			};
		},
	},
	{
		filepath: "vanilla/server/camera_preset.json",
		content: async () => {
			return {
				anyOf: [
					{
						$ref: "../definition/identifier.json",
					},
					{
						enum: Object.values(MinecraftCameraPresetsTypes),
					},
				],
			};
		},
	},
	{
		filepath: "vanilla/server/control_scheme.json",
		content: async () => {
			const { controlSchemes } = await generateCommandEnum();
			return {
				enum: controlSchemes,
			};
		},
	},
	{
		filepath: "vanilla/server/feature.json",
		content: async () => {
			const { features } = await generateCommandEnum();
			return {
				anyOf: [
					{
						$ref: "../definition/identifier.json",
					},
					{
						enum: features,
					},
				],
			};
		},
	},
	{
		filepath: "vanilla/server/block_descriptor.json",
		content: async () => {
			const blockStates = await generateServerBlockStates();
			const allOf = Object.entries(blockStates).reduce((allOf, [blockName, properties]) => {
				if (Object.keys(properties).length === 0) {
					allOf.push({
						if: {
							properties: {
								name: {
									enum: [blockName],
								},
							},
							required: ["name"],
						},
						then: {
							properties: {
								states: false,
							},
						},
					});
				} else {
					allOf.push({
						if: {
							properties: {
								name: {
									enum: [blockName],
								},
							},
							required: ["name"],
						},
						then: {
							properties: {
								states: {
									additionalProperties: false,
									properties,
								},
							},
						},
					});
				}
				return allOf;
			}, [] as any[]);
			return {
				title: "Block Descriptor",
				unevaluatedProperties: false,
				$defs: {
					block_with_states: {
						type: "object",
						required: ["name"],
						properties: {
							name: {
								$ref: "./identifiers.json#/$defs/block_identifier",
							},
						},
						allOf: [
							{
								if: {
									properties: {
										name: {
											not: {
												pattern: "^minecraft:.*$",
											},
										},
									},
								},
								then: {
									properties: {
										states: {
											additionalProperties: {
												oneOf: [
													{
														type: "integer",
													},
													{
														type: "string",
													},
													{
														type: "boolean",
													},
												],
											},
										},
									},
								},
							},
							...allOf,
						],
					},
					block_without_tags: {
						oneOf: [
							{
								$ref: "./identifiers.json#/$defs/block_identifier",
							},
							{
								$ref: "#/$defs/block_with_states",
							},
						],
					},
				},
				oneOf: [
					{
						$ref: "./identifiers.json#/$defs/block_identifier",
					},
					{
						$ref: "#/$defs/block_with_states",
					},
					{
						type: "object",
						required: ["tags"],
						properties: {
							tags: {
								$ref: "../definition/molang.json#/$defs/string",
							},
						},
					},
				],
			};
		},
	},
	{
		filepath: "vanilla/server/paths.json",
		content: async () => {
			const { lootTablePaths } = await generateServerPaths();
			return {
				$defs: {
					loot_table_path: {
						anyOf: [
							{
								type: "string",
								maxLength: 256,
							},
							{
								enum: lootTablePaths,
							},
						],
					},
				},
			};
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
			schema.$comment = `This file is generated by scripts/generator/index.ts. Do not edit this file directly.`;
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
