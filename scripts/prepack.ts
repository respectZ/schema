import { readJson, writeJson } from "./utils";

async function main() {
	for await (const entry of new Bun.Glob("schema/**/*.json").scan()) {
		const filepath = entry.replace(/\\/g, "/");
		const json = (await readJson(filepath)) as Record<string, string>;
		json["$id"] = filepath;
		await writeJson(filepath, json);
	}
}

await main();
