import type { CommonBedrockSchema } from "../../types";
import { getBedrockJSON } from "../../utils";

export async function generateServerShapes() {
	const shapeIdentifiers = await getBedrockJSON<CommonBedrockSchema<"minecraft:voxel_shape">>({
		type: "bp",
		pattern: "shapes/**/*.json",
		transform: (content) => content["minecraft:voxel_shape"].description.identifier,
	}).then((arrays) => Array.from(new Set(arrays.flat())).sort());
	return shapeIdentifiers;
}
