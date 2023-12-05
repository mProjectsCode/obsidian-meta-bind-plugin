import { type ParsingResultNode } from '../../parsers/nomParsers/GeneralNomParsers';
import { ErrorLevel, MetaBindArgumentError } from '../../utils/errors/MetaBindErrors';
import { type FieldArgumentConfig, type FieldArgumentValueConfig } from '../../config/FieldConfigs';
import { DocsUtils } from '../../utils/DocsUtils';

export abstract class AbstractFieldArgument<
	FieldType extends string,
	FieldArgumentType extends string,
	FieldConfig extends FieldArgumentConfig<FieldArgumentType, FieldType>,
> {
	value: unknown;

	abstract getConfig(): FieldConfig;

	/**
	 * Parses the values of the argument from an array of ParsingResultNodes that represent the comma separated values.
	 *
	 * @param value
	 */
	parseValue(value: ParsingResultNode[]): void {
		this.validateValues(value, this.getConfig().values);
		this._parseValue(value);
	}

	protected abstract _parseValue(value: ParsingResultNode[]): void;

	/**
	 * Validates that the values are correct.
	 * Currently, this only checks if a configuration with the supplied number of values exists.
	 *
	 * @param value
	 * @param allowedValues
	 */
	validateValues(value: ParsingResultNode[], allowedValues: FieldArgumentValueConfig[][]): void {
		if (allowedValues.find(x => x.length === value.length) === undefined) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.WARNING,
				effect: `Failed to parse argument value for argument '${this.getConfig().type}'.`,
				cause: `Expected argument values to follow the form ${allowedValues
					.map(x => (x.length === 0 ? 'none' : x.map(y => `'${y.name}'`).join(', ')))
					.join(' or ')}. Received arguments of length ${value.length}.`,
				docs: [DocsUtils.linkToSearch(this.getConfig().type)],
			});
		}
	}

	/**
	 * Checks if the argument is allowed for the supplied field type.
	 *
	 * @param fieldType
	 */
	isAllowed(fieldType: FieldType): boolean {
		if (this.getConfig().allowedFieldTypes.length === 0) {
			return true;
		}

		return this.getConfig().allowedFieldTypes.includes(fieldType);
	}

	/**
	 * Returns a list of all field types, where this argument is allowed, as a string.
	 */
	getAllowedFieldsAsString(): string {
		return this.getConfig().allowedFieldTypes.length === 0 ? 'all' : this.getConfig().allowedFieldTypes.join(', ');
	}
}
