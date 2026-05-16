import path from "path/posix";
import { createSchema, writeJson } from "./utils";

async function main() {
	let input = prompt("Filepath: ");
	if (!input) {
		console.error("No input provided");
		process.exit(1);
	}
	input = path.join("schema", input.replace(/\\/g, "/"));
	if (input.startsWith("./")) {
		input = input.slice(2);
	} else if (input.startsWith("/")) {
		input = input.slice(1);
	}
	if (!input.endsWith(".json")) {
		console.error("Invalid input: not a JSON file");
		process.exit(1);
	}
	const file = Bun.file(input);
	if (await file.exists()) {
		console.error("File already exists");
		console.warn(await file.text());
		process.exit(1);
	}
	await writeJson(input, createSchema(input));
}

await main();
