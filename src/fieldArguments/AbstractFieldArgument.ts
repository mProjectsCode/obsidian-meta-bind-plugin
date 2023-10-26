import { type ParsingResultNode } from '../parsers/nomParsers/GeneralParsers';
import { ErrorLevel, MetaBindArgumentError } from '../utils/errors/MetaBindErrors';
import { type FieldArgumentConfig, type FieldArgumentValueConfig } from '../parsers/GeneralConfigs';

export abstract class AbstractFieldArgument<
	FieldType extends string,
	FieldArgumentType extends string,
	FieldConfig extends FieldArgumentConfig<FieldArgumentType, FieldType>,
> {
	value: unknown;

	abstract getConfig(): FieldConfig;

	parseValue(value: ParsingResultNode[]): void {
		this.validateValues(value, this.getConfig().values);
		this._parseValue(value);
	}

	protected abstract _parseValue(value: ParsingResultNode[]): void;

	validateValues(value: ParsingResultNode[], allowedValues: FieldArgumentValueConfig[][]): void {
		if (allowedValues.find(x => x.length === value.length) === undefined) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.getConfig().type}'.`,
				`Expected argument values to follow the form ${allowedValues
					.map(x => (x.length === 0 ? 'none' : x.map(y => `'${y.name}'`).join(', ')))
					.join(' or ')}. Received arguments of length ${value.length}.`,
			);
		}
	}

	isAllowed(fieldType: FieldType): boolean {
		if (this.getConfig().allowedFieldTypes.length === 0) {
			return true;
		}

		return this.getConfig().allowedFieldTypes.includes(fieldType);
	}

	getAllowedFieldsAsString(): string {
		return this.getConfig().allowedFieldTypes.length === 0 ? 'all' : this.getConfig().allowedFieldTypes.join(', ');
	}
}
