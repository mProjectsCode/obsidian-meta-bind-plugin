import { ErrorCollection } from '../utils/errors/ErrorCollection';

import { IAPI } from './IAPI';
import {
	UnvalidatedBindTargetDeclaration,
	UnvalidatedInputFieldArgument,
	UnvalidatedInputFieldDeclaration,
} from '../parsers/newInputFieldParser/InputFieldDeclaration';
import { InputFieldArgumentType, InputFieldType } from '../inputFields/InputFieldConfigs';

export class InputFieldAPI {
	private readonly api: IAPI;

	constructor(api: IAPI) {
		this.api = api;
	}

	public createInputFieldDeclaration(
		inputFieldType?: InputFieldType,
		inputFieldArguments?: { name: InputFieldArgumentType; value: string[] }[]
	): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('input field declaration');

		const mappedArguments: UnvalidatedInputFieldArgument[] = (inputFieldArguments ?? []).map(x => ({
			name: { value: x.name },
			value: x.value.map(y => ({ value: y })),
		}));

		return {
			fullDeclaration: '',
			inputFieldType: inputFieldType ? { value: inputFieldType } : undefined,
			bindTarget: undefined,
			arguments: mappedArguments,
			errorCollection: errorCollection,
		} as UnvalidatedInputFieldDeclaration;
	}

	public createInputFieldDeclarationFromString(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		return this.api.newInputFieldParser.parseStringWithoutValidation(fullDeclaration);
	}

	public setType(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, inputFieldType: InputFieldType): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.inputFieldType = { value: inputFieldType };

		return unvalidatedDeclaration;
	}

	public setArguments(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value: string[] }[]
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.arguments = inputFieldArguments.map(x => ({
			name: { value: x.name },
			value: x.value.map(y => ({ value: y })),
		}));

		return unvalidatedDeclaration;
	}

	public addArgument(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value: string[] }[] | { name: InputFieldArgumentType; value: string[] }
	): UnvalidatedInputFieldDeclaration {
		if (Array.isArray(inputFieldArguments)) {
			unvalidatedDeclaration.arguments = unvalidatedDeclaration.arguments.concat(
				inputFieldArguments.map(x => ({
					name: { value: x.name },
					value: x.value.map(y => ({ value: y })),
				}))
			);
		} else {
			unvalidatedDeclaration.arguments.push({
				name: { value: inputFieldArguments.name },
				value: inputFieldArguments.value.map(y => ({ value: y })),
			});
		}

		return unvalidatedDeclaration;
	}

	public setBindTargetFile(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, bindTargetFile: string): UnvalidatedInputFieldDeclaration {
		if (unvalidatedDeclaration.bindTarget) {
			unvalidatedDeclaration.bindTarget.file = { value: bindTargetFile };
		} else {
			unvalidatedDeclaration.bindTarget = { file: { value: bindTargetFile }, path: [] };
		}

		return unvalidatedDeclaration;
	}

	public setBindTargetMetadataField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		bindTargetMetadataField: string | string[]
	): UnvalidatedInputFieldDeclaration {
		if (typeof bindTargetMetadataField === 'string') {
			bindTargetMetadataField = [bindTargetMetadataField];
		}

		if (unvalidatedDeclaration.bindTarget) {
			unvalidatedDeclaration.bindTarget.path = bindTargetMetadataField.map(x => ({ value: x }));
		} else {
			unvalidatedDeclaration.bindTarget = { file: undefined, path: bindTargetMetadataField.map(x => ({ value: x })) };
		}

		return unvalidatedDeclaration;
	}

	public setTemplateName(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, templateName: string): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.templateName = { value: templateName };
		return unvalidatedDeclaration;
	}

	public applyTemplate(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		return this.api.newInputFieldParser.applyTemplate(unvalidatedDeclaration);
	}

	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.api.newInputFieldParser.getTemplate(templateName);
	}

	public merge(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, override: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		let bindTarget = {} as UnvalidatedBindTargetDeclaration | undefined;

		if (unvalidatedDeclaration.bindTarget === undefined) {
			bindTarget = override.bindTarget;
		} else {
			bindTarget = unvalidatedDeclaration.bindTarget;
			if (override.bindTarget?.file !== undefined) {
				bindTarget.file = override.bindTarget.file;
			}
			if (override.bindTarget?.path !== undefined) {
				bindTarget.path = override.bindTarget.path;
			}
		}

		return {
			fullDeclaration: override.fullDeclaration,
			inputFieldType: override.inputFieldType !== undefined ? override.inputFieldType : unvalidatedDeclaration.inputFieldType,
			bindTarget: bindTarget,
			arguments: override.arguments.concat(unvalidatedDeclaration.arguments).reduce<UnvalidatedInputFieldArgument[]>((arr, currentValue) => {
				// filter out duplicates
				if (arr.find(x => x.name === currentValue.name) === undefined) {
					arr.push(currentValue);
				}
				return arr;
			}, []),
			errorCollection: new ErrorCollection('input field declaration').merge(unvalidatedDeclaration.errorCollection).merge(override.errorCollection),
		};
	}
}
