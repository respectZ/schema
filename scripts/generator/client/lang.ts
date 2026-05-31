import { getBedrockFile } from "../../utils";

let cached: {
	langKeys: string[];
	creativeGroups: string[];
} | null = null;
export async function generateClientLang() {
	if (!cached) {
		const { creativeGroups, langKeys } = await getBedrockFile({
			type: "rp",
			pattern: "texts/{en_US.lang}",
			transform: (content) => {
				const lines = content.split("\n");
				const langKeys: string[] = [];
				const creativeGroups: string[] = [];
				for (const line of lines) {
					const [key, value] = line.split("=");
					if (key && value) {
						langKeys.push(key.trim());
						if (key.startsWith("itemGroup.name")) {
							creativeGroups.push(key.trim());
						}
					}
				}
				return {
					langKeys,
					creativeGroups,
				};
			},
		});
		cached = {
			langKeys,
			creativeGroups,
		};
	}
	return cached;
}
