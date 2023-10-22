import { ErrorCollection } from '../utils/errors/ErrorCollection';

import { type IAPI } from './IAPI';
import {
	type UnvalidatedBindTargetDeclaration,
	type UnvalidatedFieldArgument,
	type UnvalidatedInputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type InputFieldArgumentType, type InputFieldType } from '../parsers/inputFieldParser/InputFieldConfigs';

export class InputFieldAPI {
	private readonly api: IAPI;

	constructor(api: IAPI) {
		this.api = api;
	}

	public createInputFieldDeclaration(
		inputFieldType?: InputFieldType,
		inputFieldArguments?: { name: InputFieldArgumentType; value: string[] }[],
	): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('input field declaration');

		const mappedArguments: UnvalidatedFieldArgument[] = (inputFieldArguments ?? []).map(x => ({
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
		return this.api.inputFieldParser.parseStringWithoutValidation(fullDeclaration);
	}

	public setType(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, inputFieldType: InputFieldType): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.inputFieldType = { value: inputFieldType };

		return unvalidatedDeclaration;
	}

	public setArguments(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value: string[] }[],
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.arguments = inputFieldArguments.map(x => ({
			name: { value: x.name },
			value: x.value.map(y => ({ value: y })),
		}));

		return unvalidatedDeclaration;
	}

	public addArgument(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value: string[] }[] | { name: InputFieldArgumentType; value: string[] },
	): UnvalidatedInputFieldDeclaration {
		if (Array.isArray(inputFieldArguments)) {
			unvalidatedDeclaration.arguments = unvalidatedDeclaration.arguments.concat(
				inputFieldArguments.map(x => ({
					name: { value: x.name },
					value: x.value.map(y => ({ value: y })),
				})),
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
			unvalidatedDeclaration.bindTarget = { file: { value: bindTargetFile }, path: [], boundToLocalScope: false, listenToChildren: false };
		}

		return unvalidatedDeclaration;
	}

	public setBindTargetMetadataField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		bindTargetMetadataField: string | string[],
	): UnvalidatedInputFieldDeclaration {
		if (typeof bindTargetMetadataField === 'string') {
			bindTargetMetadataField = [bindTargetMetadataField];
		}

		if (unvalidatedDeclaration.bindTarget) {
			unvalidatedDeclaration.bindTarget.path = bindTargetMetadataField.map(x => ({ value: x }));
		} else {
			unvalidatedDeclaration.bindTarget = {
				file: undefined,
				path: bindTargetMetadataField.map(x => ({ value: x })),
				boundToLocalScope: false,
				listenToChildren: false,
			};
		}

		return unvalidatedDeclaration;
	}

	public setTemplateName(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, templateName: string): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.templateName = { value: templateName };
		return unvalidatedDeclaration;
	}

	public applyTemplate(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		return this.api.inputFieldParser.applyTemplate(unvalidatedDeclaration);
	}

	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.api.inputFieldParser.getTemplate(templateName);
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
			inputFieldType: override.inputFieldType ?? unvalidatedDeclaration.inputFieldType,
			bindTarget: bindTarget,
			arguments: override.arguments.concat(unvalidatedDeclaration.arguments).reduce<UnvalidatedFieldArgument[]>((arr, currentValue) => {
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
