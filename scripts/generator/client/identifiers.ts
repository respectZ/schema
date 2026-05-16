import { getBedrockJSON } from "../../utils";

export async function generateClientIdentifiers() {
	const particleIdentifiers = await getBedrockJSON<Particle>({
		type: "rp",
		pattern: "particles/**/*.json",
		transform: (content) => content.particle_effect.description.identifier,
	});
	const soundEventIdentifiers = await getBedrockJSON<Sounds, string[]>({
		type: "rp",
		pattern: "{sounds.json}",
		transform: (content) => {
			return Object.keys(content.individual_event_sounds.events)
				.concat(Object.keys(content.individual_named_sounds.sounds))
				.concat(Object.keys(content.interactive_sounds.block_sounds));
		},
	}).then((sounds) => sounds.flat());
	return {
		particleIdentifiers,
		soundEventIdentifiers,
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
