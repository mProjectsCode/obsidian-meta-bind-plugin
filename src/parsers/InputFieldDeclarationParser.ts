import { EnclosingPair, ParserUtils } from '../utils/ParserUtils';
import { isTruthy } from '../utils/Utils';
import { InputFieldArgumentFactory } from '../inputFieldArguments/InputFieldArgumentFactory';
import { InputFieldArgumentContainer } from '../inputFieldArguments/InputFieldArgumentContainer';
import { MetaBindParsingError } from '../utils/MetaBindErrors';
import { AbstractInputFieldArgument } from 'src/inputFieldArguments/AbstractInputFieldArgument';

export enum InputFieldType {
	TOGGLE = 'toggle',
	SLIDER = 'slider',
	TEXT = 'text',
	TEXT_AREA = 'text_area',
	SELECT = 'select',
	MULTI_SELECT = 'multi_select',
	DATE = 'date',
	TIME = 'time',
	DATE_PICKER = 'date_picker',
	NUMBER = 'number',
	SUGGESTER = 'suggester',
	EDITOR = 'editor',
	IMAGE_SUGGESTER = 'imageSuggester',

	INVALID = 'invalid',
}

export enum InputFieldArgumentType {
	CLASS = 'class',
	ADD_LABELS = 'addLabels',
	MIN_VALUE = 'minValue',
	MAX_VALUE = 'maxValue',
	OPTION = 'option',
	TITLE = 'title',
	ALIGN_RIGHT = 'alignRight',
	OPTION_QUERY = 'optionQuery',
	SHOWCASE = 'showcase',

	INVALID = 'invalid',
}

export interface InputFieldDeclaration {
	/**
	 * The full declaration of the input field including the "INPUT[]".
	 * e.g.
	 * INPUT[input_type(argument_name(value)):bind_target]
	 */
	fullDeclaration?: string;
	/**
	 * Trimmed declaration of the input field including without the "INPUT[]".
	 * e.g.
	 * input_type(argument_name(value)):bind_target
	 */
	declaration?: string;
	/**
	 * The type of the input field.
	 * e.g.
	 * input_type
	 */
	inputFieldType: InputFieldType;
	/**
	 * Whether the input field is bound.
	 * e.g.
	 * true
	 */
	isBound: boolean;
	/**
	 * The frontmatter field the input field is bound to.
	 * e.g.
	 * bind_target
	 */
	bindTarget: string;
	/**
	 * A collection of the input field arguments.
	 */
	argumentContainer: InputFieldArgumentContainer;

	error?: Error | string;
}

export interface Template {
	identifier: string;
	template: InputFieldDeclaration;
}

export class InputFieldDeclarationParser {
	roundBracesPair: EnclosingPair = new EnclosingPair('(', ')');
	squareBracesPair: EnclosingPair = new EnclosingPair('[', ']');
	curlyBracesPair: EnclosingPair = new EnclosingPair('{', '}');
	allBracesPairs: EnclosingPair[] = [this.roundBracesPair, this.squareBracesPair, this.curlyBracesPair];

	templates: Template[] = [];

	parseDeclaration(
		declaration: InputFieldDeclaration,
		inputFieldArguments?: { type: InputFieldArgumentType; value: string }[] | undefined,
		templateName?: string | undefined
	): InputFieldDeclaration {
		// field type check
		declaration.inputFieldType = this.getInputFieldType(declaration.inputFieldType);

		try {
			// template check
			const useTemplate: boolean = isTruthy(templateName);
			if (useTemplate) {
				this.applyTemplate(declaration, templateName);
			}

			if (declaration.inputFieldType === InputFieldType.INVALID) {
				throw new MetaBindParsingError(`unknown input field type`);
			}

			// arguments check
			declaration.argumentContainer.mergeByOverride(this.parseArguments(declaration.inputFieldType, inputFieldArguments));
		} catch (e) {
			if (e instanceof Error) {
				declaration.error = e;
				console.warn(e);
			}
		}

		return declaration;
	}

	parseString(fullDeclaration: string): InputFieldDeclaration {
		const inputFieldDeclaration: InputFieldDeclaration = {} as InputFieldDeclaration;

		try {
			let useTemplate = false;
			let templateName = '';

			// declaration
			inputFieldDeclaration.fullDeclaration = fullDeclaration;
			const temp = ParserUtils.getInBetween(fullDeclaration, this.squareBracesPair);
			if (Array.isArray(temp)) {
				if (temp.length === 2) {
					useTemplate = true;
					templateName = temp[0];
					inputFieldDeclaration.declaration = temp[1];
				} else {
					throw new MetaBindParsingError('invalid input field declaration');
				}
			} else {
				inputFieldDeclaration.declaration = temp;
			}

			// declaration parts
			const declarationParts: string[] = ParserUtils.split(inputFieldDeclaration.declaration, ':', this.squareBracesPair);

			// bind target
			inputFieldDeclaration.bindTarget = declarationParts[1] ?? '';
			inputFieldDeclaration.isBound = isTruthy(inputFieldDeclaration.bindTarget);

			// input field type and arguments
			const inputFieldTypeWithArguments: string = declarationParts[0];
			if (inputFieldTypeWithArguments) {
				// input field type
				const inputFieldTypeString = ParserUtils.removeInBetween(inputFieldTypeWithArguments, this.roundBracesPair);
				inputFieldDeclaration.inputFieldType = this.getInputFieldType(inputFieldTypeString);

				// arguments
				const inputFieldArgumentsString: string = ParserUtils.getInBetween(inputFieldTypeWithArguments, this.roundBracesPair) as string;
				// console.log(inputFieldArgumentsString);
				if (inputFieldArgumentsString) {
					inputFieldDeclaration.argumentContainer = this.parseArgumentString(inputFieldDeclaration.inputFieldType, inputFieldArgumentsString);
				} else {
					inputFieldDeclaration.argumentContainer = new InputFieldArgumentContainer();
				}
			} else {
				inputFieldDeclaration.inputFieldType = InputFieldType.INVALID;
				inputFieldDeclaration.argumentContainer = new InputFieldArgumentContainer();
			}

			if (useTemplate) {
				this.applyTemplate(inputFieldDeclaration, templateName);
			}

			if (inputFieldDeclaration.inputFieldType === InputFieldType.INVALID) {
				throw new MetaBindParsingError(`unknown input field type`);
			}
		} catch (e) {
			if (e instanceof Error) {
				inputFieldDeclaration.error = e;
				console.warn(e);
			}
		}

		return inputFieldDeclaration;
	}

	parseTemplates(templates: string): void {
		this.templates = [];

		let templateDeclarations = templates ? ParserUtils.split(templates, '\n', this.squareBracesPair) : [];
		templateDeclarations = templateDeclarations.map(x => x.trim()).filter(x => x.length > 0);

		for (const templateDeclaration of templateDeclarations) {
			let templateDeclarationParts: string[] = ParserUtils.split(templateDeclaration, '->', this.squareBracesPair);
			templateDeclarationParts = templateDeclarationParts.map(x => x.trim());

			if (templateDeclarationParts.length === 1) {
				throw new MetaBindParsingError('Invalid template syntax');
			} else if (templateDeclarationParts.length === 2) {
				this.templates.push({
					identifier: templateDeclarationParts[0],
					template: this.parseString(templateDeclarationParts[1]),
				});
			}
		}

		console.log(`meta-bind | InputFieldDeclarationParser >> parsed templates`, this.templates);
	}

	parseArgumentString(inputFieldType: InputFieldType, inputFieldArgumentsString: string): InputFieldArgumentContainer {
		let inputFieldArgumentStrings: string[] = ParserUtils.split(inputFieldArgumentsString, ',', this.roundBracesPair);
		inputFieldArgumentStrings = inputFieldArgumentStrings.map(x => x.trim());

		const inputFieldArguments: { type: InputFieldArgumentType; value: string }[] = [];

		for (const inputFieldArgumentString of inputFieldArgumentStrings) {
			const inputFieldArgumentTypeString: string = this.extractInputFieldArgumentIdentifier(inputFieldArgumentString);
			const inputFieldArgumentType: InputFieldArgumentType = this.getInputFieldArgumentType(inputFieldArgumentTypeString);
			const inputFieldArgumentValue: string = this.extractInputFieldArgumentValue(inputFieldArgumentString);

			if (inputFieldArgumentType === InputFieldArgumentType.INVALID) {
				throw new MetaBindParsingError(`unknown argument '${inputFieldArgumentTypeString}'`);
			}

			inputFieldArguments.push({ type: inputFieldArgumentType, value: inputFieldArgumentValue });
		}
		return this.parseArguments(inputFieldType, inputFieldArguments);
	}

	parseArguments(inputFieldType: InputFieldType, inputFieldArguments?: { type: InputFieldArgumentType; value: string }[] | undefined): InputFieldArgumentContainer {
		console.log('-> inputFieldArguments', inputFieldArguments);
		const argumentContainer: InputFieldArgumentContainer = new InputFieldArgumentContainer();

		if (inputFieldArguments) {
			for (const argument of inputFieldArguments) {
				const inputFieldArgument: AbstractInputFieldArgument = InputFieldArgumentFactory.createInputFieldArgument(argument.type);

				if (!inputFieldArgument.isAllowed(inputFieldType)) {
					throw new MetaBindParsingError(`argument '${argument.type}' is only applicable to ${inputFieldArgument.getAllowedInputFieldsAsString()} input fields`);
				}

				if (inputFieldArgument.requiresValue) {
					inputFieldArgument.parseValue(argument.value);
				}

				argumentContainer.add(inputFieldArgument);
			}

			argumentContainer.validate();
		}

		return argumentContainer;
	}

	extractInputFieldArgumentIdentifier(argumentString: string): string {
		return ParserUtils.removeInBetween(argumentString, this.roundBracesPair);
	}

	extractInputFieldArgumentValue(argumentString: string): string {
		const argumentName = this.extractInputFieldArgumentIdentifier(argumentString);

		const argumentValue = ParserUtils.getInBetween(argumentString, this.roundBracesPair) as string;
		if (!argumentValue) {
			throw new MetaBindParsingError(`argument '${argumentName}' requires a non empty value`);
		}

		return argumentValue;
	}

	getInputFieldArgumentType(str: string): InputFieldArgumentType {
		for (const entry of Object.entries(InputFieldArgumentType)) {
			if (entry[1] === str) {
				return entry[1];
			}
		}

		return InputFieldArgumentType.INVALID;
	}

	getInputFieldType(str: string): InputFieldType {
		for (const entry of Object.entries(InputFieldType)) {
			if (entry[1] === str) {
				return entry[1];
			}
		}

		return InputFieldType.INVALID;
	}

	applyTemplate(inputFieldDeclaration: InputFieldDeclaration, templateName: string | null | undefined): void {
		if (!templateName) {
			return;
		}

		const template = this.templates.find(x => x.identifier === templateName)?.template;
		if (!template) {
			throw new MetaBindParsingError(`unknown template name \'${templateName}\'`);
		}

		inputFieldDeclaration.bindTarget = inputFieldDeclaration.bindTarget || template.bindTarget;
		inputFieldDeclaration.isBound = inputFieldDeclaration.isBound || template.isBound;
		inputFieldDeclaration.inputFieldType =
			(inputFieldDeclaration.inputFieldType === InputFieldType.INVALID ? template.inputFieldType : inputFieldDeclaration.inputFieldType) || template.inputFieldType;
		inputFieldDeclaration.argumentContainer = template.argumentContainer.mergeByOverride(inputFieldDeclaration.argumentContainer);
	}
}
