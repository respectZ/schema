import { getBedrockJSON } from "../../utils";

let cached: Result | null = null;
export async function generateCommandEnum() {
	if (!cached) {
		const [result] = await getBedrockJSON<MojangCommands, Result>({
			type: "metadata",
			pattern: "command_modules/{mojang-commands.json}",
			transform: (content) => {
				const result: Result = {
					gameRules: [],
					controlSchemes: [],
				};
				const mapSet: Record<keyof Result, Set<string>> = {
					gameRules: new Set<string>(["BoolGameRule", "IntGameRule"]),
					controlSchemes: new Set<string>(["controlscheme"]),
				};
				for (const commandEnum of content.command_enums) {
					for (const [key, value] of Object.entries(mapSet)) {
						if (value.has(commandEnum.name)) {
							for (const { value } of commandEnum.values) {
								result[key as keyof Result].push(value);
							}
						}
					}
				}
				return result;
			},
		});
		result.gameRules.sort();
		result.controlSchemes.sort();
		cached = result;
	}
	return cached;
}

type MojangCommands = {
	command_enums: Array<{
		name: string;
		values: Array<{
			value: string;
		}>;
	}>;
};

type Result = {
	gameRules: string[];
	controlSchemes: string[];
};
