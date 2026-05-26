import { getBedrockJSON } from "../../utils";

export async function generateServerTypeFamily() {
	const typeFamily = await getBedrockJSON<Entity, string[]>({
		type: "bp",
		pattern: "entities/**/*.json",
		transform: (content) => {
			const entity = content["minecraft:entity"];
			const result: string[] = [];
			if (entity.components?.["minecraft:type_family"]) {
				result.push(...entity.components["minecraft:type_family"].family);
			}
			if (entity.component_groups) {
				for (const group of Object.values(entity.component_groups)) {
					if (group["minecraft:type_family"]) {
						result.push(...group["minecraft:type_family"].family);
					}
				}
			}
			return result;
		},
	}).then((arrays) => Array.from(new Set(arrays.flat())).sort());
	return typeFamily;
}

type Entity = {
	"minecraft:entity": {
		components?: EntityComponents;
		component_groups?: Record<string, EntityComponents>;
	};
};

type EntityComponents = {
	"minecraft:type_family"?: {
		family: string[];
	};
};
