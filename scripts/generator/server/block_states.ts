import { getBedrockJSON } from "../../utils";

export async function generateServerBlockStates() {
	const [result] = await getBedrockJSON<
		MojangBlocks,
		Record<string, Record<string, PropertySchema>>
	>({
		type: "metadata",
		source: "bedrock-samples",
		pattern: "vanilladata_modules/{mojang-blocks}.json",
		transform: (content) => {
			const blockStates = new Map<string, BlockStateValue>();
			const blocks: Record<string, Record<string, PropertySchema>> = {};
			for (const blockProperty of content.block_properties) {
				const { name, type, values } = blockProperty;
				blockStates.set(name, {
					type,
					values: values.map((v) => v.value),
				});
			}
			for (const dataItem of content.data_items) {
				blocks[dataItem.name] = {};
				if (dataItem.properties.length === 0) {
					continue;
				}
				for (const property of dataItem.properties) {
					const blockState = blockStates.get(property.name);
					if (!blockState) {
						throw new Error(`Block state ${property.name} not found for block ${dataItem.name}`);
					}
					const { type, values } = blockState;
					blocks[dataItem.name][property.name] = {
						type: type === "bool" ? "boolean" : type === "int" ? "integer" : "string",
						enum:
							type === "string" || type === "int" ? (values as Array<string | number>) : undefined,
					};
				}
			}
			return blocks;
		},
	});
	return result;
}
type BlockStateValue = {
	type: "bool" | "int" | "string";
	values: Array<string | number | boolean>;
};
type PropertySchema = {
	type: "boolean" | "integer" | "string";
	enum?: Array<string | number>;
};

type MojangBlocks = {
	block_properties: Array<{
		name: string;
		type: "bool" | "int" | "string";
		values: Array<{
			value: string | number | boolean;
		}>;
	}>;
	data_items: Array<{
		name: string;
		properties: Array<{
			name: string;
		}>;
	}>;
};
