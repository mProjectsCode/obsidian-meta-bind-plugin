import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { ErrorLevel, MetaBindArgumentError } from '../utils/errors/MetaBindErrors';
import { ParsingResultNode } from '../parsers/newInputFieldParser/InputFieldDeclarationValidator';

export abstract class AbstractInputFieldArgument {
	identifier: InputFieldArgumentType = InputFieldArgumentType.INVALID;
	allowedInputFields: InputFieldType[] = [];
	value: any;
	valueLengthMin: number = 0;
	valueLengthMax: number = 0;
	allowMultiple: boolean = false;

	parseValue(value: ParsingResultNode[]): void {
		this.validateValueLength(value, this.valueLengthMin, this.valueLengthMax);
		this._parseValue(value);
	}

	protected abstract _parseValue(value: ParsingResultNode[]): void;

	validateValueLength(value: ParsingResultNode[], min: number, max: number): void {
		if (value.length < min) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.identifier}'.`,
				`Expected length of argument value to be between ${min} and ${max}. Received ${value.length}.`
			);
		}

		if (value.length > max) {
			throw new MetaBindArgumentError(
				ErrorLevel.WARNING,
				`Failed to parse argument value for argument '${this.identifier}'.`,
				`Expected length of argument value to be between ${min} and ${max}. Received ${value.length}.`
			);
		}
	}

	isAllowed(inputFieldType: InputFieldType): boolean {
		if (this.allowedInputFields.length === 0) {
			return true;
		}

		return this.allowedInputFields.contains(inputFieldType);
	}

	getAllowedInputFieldsAsString(): string {
		return this.allowedInputFields.length === 0 ? 'all' : this.allowedInputFields.join(', ');
	}
}
