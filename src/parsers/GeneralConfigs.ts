export interface FieldArgumentValueConfig {
	name: string;
	// empty is any
	allowed: string[];
	description: string;
}

export interface FieldArgumentConfig<ArgumentType extends string, FieldType extends string> {
	type: ArgumentType;
	allowedFieldTypes: FieldType[];
	values: FieldArgumentValueConfig[][];
	allowMultiple: boolean;
}
