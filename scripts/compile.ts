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
		fileMatch: "entity/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/entity/_index.json",
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
		fileMatch: "textures/flipbook_textures.{json,jsonc,json5}",
		url: "./schema/bedrock/client/flipbook_textures/_index.json",
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
		fileMatch: "sounds/music_definitions.{json,jsonc,json5}",
		url: "./schema/bedrock/client/music_definitions/_index.json",
	},
	{
		fileMatch: "particles/**/*.{json,jsonc,json5}",
		url: "./schema/bedrock/client/particle/_index.json",
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
