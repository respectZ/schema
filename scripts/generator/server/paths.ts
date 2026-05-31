import { getBedrockFilepaths } from "../../utils";

export async function generateServerPaths() {
	const lootTablePaths = await getBedrockFilepaths({
		type: "bp",
		pattern: "loot_tables/**/*.json",
		extension: true,
		relative: true,
		sort: true,
	});
	return {
		lootTablePaths,
	};
}
