import { getBedrockJSON } from "../../utils";

export async function generateServerBiomeTag() {
	const typeFamily = await getBedrockJSON<Biome, string[]>({
		type: "bp",
		pattern: "biomes/**/*.json",
		transform: (content) => content["minecraft:biome"].components["minecraft:tags"]?.tags ?? [],
	}).then((arrays) => Array.from(new Set(arrays.flat())).sort());
	return typeFamily;
}

type Biome = {
	"minecraft:biome": {
		components: {
			"minecraft:tags"?: {
				tags: string[];
			};
		};
	};
};
