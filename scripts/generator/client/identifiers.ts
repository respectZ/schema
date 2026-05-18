import { getBedrockJSON } from "../../utils";

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
	return {
		particleIdentifiers,
		soundEventIdentifiers,
		soundIdentifiers,
		terrainTextureIdentifiers,
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
