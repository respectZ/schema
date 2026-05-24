import type { CommonBedrockSchema } from "../../types";
import { getBedrockJSON } from "../../utils";

const isLegacyGeometry = (data: unknown): data is LegacyGeometry => {
	if (typeof data !== "object" || data === null) {
		return false;
	}
	return "format_version" in data && data["format_version"] === "1.8.0";
};

const isGeometry = (data: unknown): data is Geometries => {
	if (typeof data !== "object" || data === null) {
		return false;
	}
	return "minecraft:geometry" in data && Array.isArray(data["minecraft:geometry"]);
};

const getIdentifierFromSchema = (obj: unknown, key: string): string => {
	if (typeof obj !== "object" || obj === null) {
		throw new Error(`Expected an object but got ${typeof obj}`);
	}
	// @ts-expect-error: unknown type
	const value = obj[key]?.description?.identifier;
	if (typeof value !== "string") {
		throw new Error(`Expected a string identifier but got ${typeof value}`);
	}
	return value;
};

export async function generateClientIdentifiers() {
	const particleIdentifiers = await getBedrockJSON<Particle>({
		type: "rp",
		pattern: "particles/**/*.json",
		transform: (content) => content.particle_effect.description.identifier,
	});
	type SountEventResult = {
		blocks: string[];
		events: string[];
	};
	const [soundEventIdentifiers] = await getBedrockJSON<Sounds, SountEventResult>({
		type: "rp",
		pattern: "{sounds.json}",
		transform: (content) => {
			const blocks = Object.keys(content.block_sounds);
			const events = Object.keys(content.individual_event_sounds.events)
				.concat(Object.keys(content.individual_named_sounds.sounds))
				.concat(Object.keys(content.interactive_sounds.block_sounds));
			return {
				blocks,
				events,
			};
		},
	});
	const [soundIdentifiers] = await getBedrockJSON<SoundIdentifiers, string[]>({
		type: "rp",
		pattern: "sounds/{sound_definitions.json}",
		transform: (content) => Object.keys(content.sound_definitions),
	});
	const [terrainTextureIdentifiers] = await getBedrockJSON<TextureAtlas, string[]>({
		type: "rp",
		pattern: "textures/{terrain_texture.json}",
		transform: (content) => Object.keys(content.texture_data),
	});
	const [materialIdentifiers] = await getBedrockJSON<Materials, string[]>({
		type: "rp",
		source: "data",
		pattern: "vanilla/materials/{entity.material}",
		transform: (content) => {
			const result: string[] = [];
			for (const key of Object.keys(content.materials)) {
				if (key !== "version") {
					const material = key.includes(":") ? key.split(":")[0] : key;
					result.push(material);
				}
			}
			return result;
		},
	});
	const geometryIdentifiers = await getBedrockJSON<unknown, string[]>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "models/entity/**/*.json",
		transform: (content) => {
			if (isLegacyGeometry(content)) {
				const keys: string[] = [];
				for (const key of Object.keys(content)) {
					if (key !== "format_version") {
						const id = key.includes(":") ? key.split(":")[0] : key;
						keys.push(id);
					}
				}
			}
			if (isGeometry(content)) {
				return content["minecraft:geometry"].map((geometry) => geometry.description.identifier);
			}
			return [];
		},
	}).then((arrays) => arrays.flat().sort());
	const animationIdentifiers = await getBedrockJSON<Animations, string[]>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "animations/**/*.json",
		transform: (content) => Object.keys(content.animations),
	}).then((arrays) => arrays.flat().sort());
	const animationControllerIdentifiers = await getBedrockJSON<AnimationControllers, string[]>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "animation_controllers/**/*.json",
		transform: (content) => Object.keys(content.animation_controllers),
	}).then((arrays) => arrays.flat().sort());
	const renderControllerIdentifiers = await getBedrockJSON<RenderControllers, string[]>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "render_controllers/**/*.json",
		transform: (content) => Object.keys(content.render_controllers),
	}).then((arrays) => arrays.flat().sort());
	const [itemTextureIdentifiers] = await getBedrockJSON<TextureAtlas, string[]>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "textures/{item_texture.json}",
		transform: (content) => Object.keys(content.texture_data),
	}).then((arrays) => arrays.sort());
	const fogIdentifiers = await getBedrockJSON<CommonBedrockSchema<"minecraft:fog_settings">>({
		type: "rp",
		source: "bedrock-samples",
		pattern: "fogs/**/*.json",
		transform: (content) => content["minecraft:fog_settings"].description.identifier,
	}).then((arrays) => arrays.sort());
	const atmosphereIdentifiers = await getBedrockJSON<
		CommonBedrockSchema<"minecraft:atmosphere_settings">
	>({
		type: "rp",
		source: "data",
		pattern: "*/atmospherics/**/*.json",
		transform: (content) => content["minecraft:atmosphere_settings"].description.identifier,
	}).then((arrays) => Array.from(new Set(arrays.sort())));
	const colorGradingIdentifiers = await getBedrockJSON<
		CommonBedrockSchema<"minecraft:color_grading_settings">
	>({
		type: "rp",
		source: "data",
		pattern: "*/color_grading/**/*.json",
		transform: (content) => content["minecraft:color_grading_settings"].description.identifier,
	}).then((arrays) => Array.from(new Set(arrays.sort())));
	const lightingIdentifiers = await getBedrockJSON<
		CommonBedrockSchema<"minecraft:lighting_settings">
	>({
		type: "rp",
		source: "data",
		pattern: "*/lighting/**/*.json",
		transform: (content) => content["minecraft:lighting_settings"].description.identifier,
	}).then((arrays) => Array.from(new Set(arrays.sort())));
	const waterIdentifiers = await getBedrockJSON<CommonBedrockSchema<"minecraft:water_settings">>({
		type: "rp",
		source: "data",
		pattern: "*/water/**/*.json",
		transform: (content) => content["minecraft:water_settings"].description.identifier,
	}).then((arrays) => Array.from(new Set(arrays.sort())));
	return {
		particleIdentifiers,
		soundEventIdentifiers,
		soundIdentifiers,
		terrainTextureIdentifiers,
		materialIdentifiers,
		geometryIdentifiers,
		animationIdentifiers,
		animationControllerIdentifiers,
		renderControllerIdentifiers,
		itemTextureIdentifiers,
		fogIdentifiers,
		atmosphereIdentifiers,
		colorGradingIdentifiers,
		lightingIdentifiers,
		waterIdentifiers,
	};
}

type Particle = {
	particle_effect: {
		description: {
			identifier: string;
		};
	};
};

type Sounds = {
	block_sounds: Record<string, unknown>;
	entity_sounds: Record<string, unknown>;
	individual_event_sounds: {
		events: Record<string, unknown>;
	};
	individual_named_sounds: {
		sounds: Record<string, unknown>;
	};
	interactive_sounds: {
		block_sounds: Record<string, unknown>;
	};
};

type SoundIdentifiers = {
	sound_definitions: Record<string, unknown>;
};

type TextureAtlas = {
	texture_data: Record<string, unknown>;
};

type Materials = {
	materials: Record<string, unknown>;
};

type Geometries = {
	"minecraft:geometry": {
		description: {
			identifier: string;
		};
	}[];
};

type LegacyGeometry = Record<string, unknown>;

type Animations = {
	animations: Record<string, unknown>;
};

type AnimationControllers = {
	animation_controllers: Record<string, unknown>;
};

type RenderControllers = {
	render_controllers: Record<string, unknown>;
};
