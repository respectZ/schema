import path from "path/posix";

const PACK_PREFIXES = {
	bp: ["behavior_pack/", "*BP/", "BP_*/", "*bp/", "bp_*/"],
	rp: ["resource_pack/", "*RP/", "RP_*/", "*rp/", "rp_*/"],
};

const BP_ENTRIES: JsonValidationEntry[] = [
	{
		fileMatch: "manifest.{json,jsonc,json5}",
		url: "./schema/bedrock/shared/manifest/_index.json",
	},
	{
		fileMatch: "animation_controllers/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/animation_controller/_index.json",
	},
	{
		fileMatch: "animations/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/animation/_index.json",
	},
	{
		fileMatch: "shapes/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/voxel/_index.json",
	},
	{
		fileMatch: "dimensions/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/dimension/_index.json",
	},
	{
		fileMatch: "dialogue/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/dialogue/_index.json",
	},
	{
		fileMatch: "aim_assist/categories/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/aim_assist_categories/_index.json",
	},
	{
		fileMatch: "aim_assist/presets/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/aim_assist/_index.json",
	},
	{
		fileMatch: "loot_tables/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/loot_table/_index.json",
	},
	{
		fileMatch: "trading/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/trading/_index.json",
	},
	{
		fileMatch: "recipes/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/recipe/_index.json",
	},
	{
		fileMatch: "item_catalog/crafting_item_catalog.{json,jsonc,json5}",
		url: "./schema/bedrock/server/crafting_item_catalog/_index.json",
	},
	{
		fileMatch: "items/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/item/_index.json",
	},
	{
		fileMatch: "cameras/presets/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/camera/_index.json",
	},
	{
		fileMatch: "feature_rules/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/feature_rule/_index.json",
	},
	{
		fileMatch: "features/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/features/_index.json",
	},
	{
		fileMatch: "spawn_rules/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/spawn_rule/_index.json",
	},
	{
		fileMatch: "worldgen/structure_sets/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/worldgen/structure_set/_index.json",
	},
	{
		fileMatch: "worldgen/template_pools/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/worldgen/template_pool/_index.json",
	},
	{
		fileMatch: "worldgen/processors/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/worldgen/processor_list/_index.json",
	},
	{
		fileMatch: "worldgen/structures/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/server/worldgen/jigsaw_structure/_index.json",
	},
];

const RP_ENTRIES: JsonValidationEntry[] = [
	{
		fileMatch: "manifest.{json,jsonc,json5}",
		url: "./schema/bedrock/shared/manifest/_index.json",
	},
	{
		fileMatch: "animation_controllers/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/animation_controller/_index.json",
	},
	{
		fileMatch: "animations/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/animation/_index.json",
	},
	{
		fileMatch: "atmospherics/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/atmospheric/_index.json",
	},
	{
		fileMatch: "attachables/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/attachable/_index.json",
	},
	{
		fileMatch: "biomes/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/biome/_index.json",
	},
	{
		fileMatch: "cubemaps/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/cubemap/_index.json",
	},
	{
		fileMatch: "entity/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/entity/_index.json",
	},
	{
		fileMatch: "biomes_client.{json,jsonc,json5}",
		url: "./schema/bedrock/client/biomes_client/_index.json",
	},
	{
		fileMatch: "block_culling/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/block_culling/_index.json",
	},
	{
		fileMatch: "blocks.{json,jsonc,json5}",
		url: "./schema/bedrock/client/blocks/_index.json",
	},
	{
		fileMatch: "color_grading/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/color_grading/_index.json",
	},
	{
		fileMatch: "shadows/global.{json,jsonc,json5}",
		url: "./schema/bedrock/client/shadows/_index.json",
	},
	{
		fileMatch: "textures/flipbook_textures.{json,jsonc,json5}",
		url: "./schema/bedrock/client/flipbook_textures/_index.json",
	},
	{
		fileMatch: "models/**/*.geo.{json,jsonc,json5}",
		url: "./schema/bedrock/client/geometry/_index.json",
	},
	{
		fileMatch: "fogs/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/fog/_index.json",
	},
	{
		fileMatch: "items/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/item/_index.json",
	},
	{
		fileMatch: "textures/item_texture.{json,jsonc,json5}",
		url: "./schema/bedrock/client/item_texture/_index.json",
	},
	{
		fileMatch: "texts/languages.{json,jsonc,json5}",
		url: "./schema/bedrock/client/languages/_index.json",
	},
	{
		fileMatch: "lighting/global.{json,jsonc,json5}",
		url: "./schema/bedrock/client/lighting/_index.json",
	},
	{
		fileMatch: "local_lighting/local_lighting.{json,jsonc,json5}",
		url: "./schema/bedrock/client/local_lighting/_index.json",
	},
	{
		fileMatch: "materials/*.material",
		url: "./schema/bedrock/client/material/_index.json",
	},
	{
		fileMatch: "sounds/music_definitions.{json,jsonc,json5}",
		url: "./schema/bedrock/client/music_definitions/_index.json",
	},
	{
		fileMatch: "particles/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/particle/_index.json",
	},
	{
		fileMatch: "pbr/global.{json,jsonc,json5}",
		url: "./schema/bedrock/client/pbr/_index.json",
	},
	{
		fileMatch: "point_lights/global.{json,jsonc,json5}",
		url: "./schema/bedrock/client/point_lights/_index.json",
	},
	{
		fileMatch: "render_controllers/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/render_controller/_index.json",
	},
	{
		fileMatch: "sounds/sound_definitions.{json,jsonc,json5}",
		url: "./schema/bedrock/client/sound_definitions/_index.json",
	},
	{
		fileMatch: "sounds.{json,jsonc,json5}",
		url: "./schema/bedrock/client/sounds/_index.json",
	},
	{
		fileMatch: "textures/terrain_texture.{json,jsonc,json5}",
		url: "./schema/bedrock/client/terrain_texture/_index.json",
	},
	{
		fileMatch: "textures/texture_list.{json,jsonc,json5}",
		url: "./schema/bedrock/client/texture_list/_index.json",
	},
	{
		fileMatch: "textures/**/*.texture_set.{json,jsonc,json5}",
		url: "./schema/bedrock/client/texture_set/_index.json",
	},
	{
		fileMatch: "water/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/water/_index.json",
	},
];

function mapFileMatch(type: keyof typeof PACK_PREFIXES, entry: JsonValidationEntry) {
	const prefixes = type === "bp" ? PACK_PREFIXES.bp : PACK_PREFIXES.rp;
	if (Array.isArray(entry.fileMatch)) {
		entry.fileMatch = entry.fileMatch.flatMap((fileMatch) =>
			prefixes.map((prefix) => path.join(prefix, fileMatch)),
		);
		return entry;
	}
	entry.fileMatch = prefixes.map((prefix) => path.join(prefix, entry.fileMatch as string));
	return entry;
}

async function main() {
	const result: JsonValidationEntry[] = [];
	for (const entry of BP_ENTRIES) {
		result.push(mapFileMatch("bp", entry));
	}
	for (const entry of RP_ENTRIES) {
		result.push(mapFileMatch("rp", entry));
	}
	result.sort((a, b) => {
		const aMatch = Array.isArray(a.fileMatch) ? a.fileMatch[0] : a.fileMatch;
		const bMatch = Array.isArray(b.fileMatch) ? b.fileMatch[0] : b.fileMatch;
		return aMatch.localeCompare(bMatch);
	});
	const pkg: Package = await Bun.file("package.json").json();
	pkg.contributes.jsonValidation = result;
	await Bun.write("package.json", JSON.stringify(pkg, null, "\t") + "\n");
}

await main();

type JsonValidationEntry = {
	fileMatch: string | string[];
	url: string;
};

type Package = {
	contributes: {
		jsonValidation: JsonValidationEntry[];
	};
};
