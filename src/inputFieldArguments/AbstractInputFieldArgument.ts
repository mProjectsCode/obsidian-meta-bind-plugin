import { ErrorLevel, MetaBindArgumentError } from '../utils/errors/MetaBindErrors';
import { ParsingResultNode } from '../parsers/inputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldArgumentValueConfig, InputFieldType } from '../inputFields/InputFieldConfigs';

export abstract class AbstractInputFieldArgument {
	value: any;

	abstract getConfig(): InputFieldArgumentConfig;

	parseValue(value: ParsingResultNode[]): void {
		this.validateValues(value, this.getConfig().values);
		this._parseValue(value);
	}

	protected abstract _parseValue(value: ParsingResultNode[]): void;

	validateValues(value: ParsingResultNode[], allowedValues: InputFieldArgumentValueConfig[][]): void {
		const min = allowedValues[0].length;
		const max = allowedValues[allowedValues.length - 1].length;

		if (allowedValues.find(x => x.length === value.length) === undefined) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.getConfig().type}'.`,
				`Expected argument values to follow the form ${allowedValues
					.map(x => (x.length === 0 ? 'none' : x.map(y => `'${y.name}'`).join(', ')))
					.join(' or ')}. Received arguments of length ${value.length}.`
			);
		}
	}

	isAllowed(inputFieldType: InputFieldType): boolean {
		if (this.getConfig().allowedInputFieldTypes.length === 0) {
			return true;
		}

		console.log(this.getConfig().allowedInputFieldTypes);

		return this.getConfig().allowedInputFieldTypes.includes(inputFieldType);
	}

	getAllowedInputFieldsAsString(): string {
		return this.getConfig().allowedInputFieldTypes.length === 0 ? 'all' : this.getConfig().allowedInputFieldTypes.join(', ');
	}
}
