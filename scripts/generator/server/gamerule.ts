import { getBedrockJSON } from "../../utils";

export async function generateServerGameRule() {
	const [gameRule] = await getBedrockJSON<MojangCommands, string[]>({
		type: "metadata",
		pattern: "command_modules/{mojang-commands.json}",
		transform: (content) => {
			const result: string[] = [];
			const names = new Set<string>(["BoolGameRule", "IntGameRule"]);
			for (const commandEnum of content.command_enums) {
				if (names.has(commandEnum.name)) {
					for (const { value } of commandEnum.values) {
						result.push(value);
					}
				}
			}
			return result;
		},
	}).then((arrays) => arrays.sort());
	return gameRule;
}

type MojangCommands = {
	command_enums: Array<{
		name: string;
		values: Array<{
			value: string;
		}>;
	}>;
};
