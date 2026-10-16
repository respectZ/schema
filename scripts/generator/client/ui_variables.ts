import { getBedrockJSON } from "../../utils";

export async function generateClientUIVariables() {
	const [uiVariables] = await getBedrockJSON<Record<string, unknown>, string[]>({
		type: "rp",
		pattern: "ui/{_global_variables.json}",
		transform: (content) => Object.keys(content),
	});
	return uiVariables;
}
