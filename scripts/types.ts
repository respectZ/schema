export type RootSchema = {
	$schema?: string;
	$id?: string;
	definitions?: Record<string, Schema>;
};

export type Schema = {
	type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
	enum?: string[];
};
