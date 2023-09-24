import { ErrorLevel, MetaBindArgumentError } from '../utils/errors/MetaBindErrors';
import { ParsingResultNode } from '../parsers/newInputFieldParser/InputFieldParser';
import { InputFieldArgumentConfig, InputFieldType } from '../inputFields/InputFieldConfigs';

export abstract class AbstractInputFieldArgument {
	value: any;

	abstract getConfig(): InputFieldArgumentConfig;

	parseValue(value: ParsingResultNode[]): void {
		this.validateValueLength(value, this.getConfig().valueLengthMin, this.getConfig().valueLengthMax);
		this._parseValue(value);
	}

	protected abstract _parseValue(value: ParsingResultNode[]): void;

	validateValueLength(value: ParsingResultNode[], min: number, max: number): void {
		if (value.length < min) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.getConfig().type}'.`,
				`Expected length of argument value to be between ${min} and ${max}. Received ${value.length}.`
			);
		}

		if (value.length > max) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.getConfig().type}'.`,
				`Expected length of argument value to be between ${min} and ${max}. Received ${value.length}.`
			);
		}
	}

	isAllowed(inputFieldType: InputFieldType): boolean {
		if (this.getConfig().allowedInputFieldTypes.length === 0) {
			return true;
		}

		return this.getConfig().allowedInputFieldTypes.contains(inputFieldType);
	}

	getAllowedInputFieldsAsString(): string {
		return this.getConfig().allowedInputFieldTypes.length === 0 ? 'all' : this.getConfig().allowedInputFieldTypes.join(', ');
	}
}
