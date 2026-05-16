import { getBedrockFile } from "../../utils";

export async function generateClientLang() {
	const langKeys = await getBedrockFile({
		type: "rp",
		pattern: "texts/{en_US.lang}",
		transform: (content) => {
			const lines = content.split("\n");
			const result: string[] = [];
			for (const line of lines) {
				const [key, value] = line.split("=");
				if (key && value) {
					result.push(key.trim());
				}
			}
			return result;
		},
	});
	return {
		langKeys,
	};
}
