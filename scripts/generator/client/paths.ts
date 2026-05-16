import { getBedrockFilepaths } from "../../utils";

export async function generateClientPaths() {
	const texturePaths = await getBedrockFilepaths({
		type: "rp",
		pattern: "textures/**/*.{tga,png,jpg,jpeg}",
		extension: false,
		relative: true,
		sort: true,
	});
	const soundPaths = await getBedrockFilepaths({
		type: "rp",
		pattern: "sounds/**/*.{fsb,ogg}",
		extension: false,
		relative: true,
		sort: true,
	});
	return {
		texturePaths,
		soundPaths,
	};
}
