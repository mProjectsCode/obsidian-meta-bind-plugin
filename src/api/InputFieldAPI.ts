import { InputFieldArgumentType, InputFieldType } from '../parsers/InputFieldDeclarationParser';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { API } from './API';
import { useSyncExternalStore } from 'preact/compat';
import { UnvalidatedInputFieldDeclaration } from '../parsers/newInputFieldParser/InputFieldDeclarationValidator';
import { StructureParserResult } from '../parsers/newInputFieldParser/StructureParser';

export class InputFieldAPI {
	private readonly api: API;

	constructor(api: API) {
		this.api = api;
	}

	public createInputFieldDeclaration(
		inputFieldType?: InputFieldType,
		inputFieldArguments?: { name: InputFieldArgumentType; value?: string }[]
	): UnvalidatedInputFieldDeclaration {
		const errorCollection = new ErrorCollection('input field declaration');

		const mappedArguments = (inputFieldArguments ?? []).map(x => ({
			name: { result: x.name },
			value: x.value !== undefined ? { result: x.value } : undefined,
		}));

		return {
			fullDeclaration: '',
			inputFieldType: inputFieldType ? { result: inputFieldType } : undefined,
			bindTargetFile: undefined,
			bindTargetPath: undefined,
			arguments: mappedArguments,
			errorCollection: errorCollection,
		} as UnvalidatedInputFieldDeclaration;
	}

	public createInputFieldDeclarationFromString(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		return this.api.newInputFieldParser.parseStringWithoutValidation(fullDeclaration);
	}

	public setType(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, inputFieldType: InputFieldType): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.inputFieldType = { result: inputFieldType };

		return unvalidatedDeclaration;
	}

	public setArguments(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value?: string | undefined }[]
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.arguments = inputFieldArguments.map(x => ({
			name: { result: x.name },
			value: x.value !== undefined ? { result: x.value } : undefined,
		}));

		return unvalidatedDeclaration;
	}

	public addArgument(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments: { name: InputFieldArgumentType; value?: string | undefined }[] | { name: InputFieldArgumentType; value?: string | undefined }
	): UnvalidatedInputFieldDeclaration {
		if (Array.isArray(inputFieldArguments)) {
			unvalidatedDeclaration.arguments = unvalidatedDeclaration.arguments.concat(
				inputFieldArguments.map(x => ({
					name: { result: x.name },
					value: x.value !== undefined ? { result: x.value } : undefined,
				}))
			);
		} else {
			unvalidatedDeclaration.arguments.push({
				name: { result: inputFieldArguments.name },
				value: inputFieldArguments.value !== undefined ? { result: inputFieldArguments.value } : undefined,
			});
		}

		return unvalidatedDeclaration;
	}

	public setBindTargetFile(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, bindTargetFile: string): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.bindTargetFile = { result: bindTargetFile };

		return unvalidatedDeclaration;
	}

	public setBindTargetMetadataField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		bindTargetMetadataField: string
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.bindTargetPath = { result: bindTargetMetadataField };

		return unvalidatedDeclaration;
	}

	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.api.newInputFieldParser.getTemplate(templateName);
	}

	public merge(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration, override: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		return {
			fullDeclaration: '',
			inputFieldType: override.inputFieldType !== undefined ? override.inputFieldType : unvalidatedDeclaration.inputFieldType,
			bindTargetFile: override.bindTargetFile !== undefined ? override.bindTargetFile : unvalidatedDeclaration.bindTargetFile,
			bindTargetPath: override.bindTargetPath !== undefined ? override.bindTargetPath : unvalidatedDeclaration.bindTargetPath,
			arguments: override.arguments.concat(unvalidatedDeclaration.arguments).reduce((arr, currentValue) => {
				// filter out duplicates
				if (arr.find(x => x.name === currentValue.name) === undefined) {
					arr.push(currentValue);
				}
				return arr;
			}, [] as { name: StructureParserResult; value?: StructureParserResult | undefined }[]),
			errorCollection: unvalidatedDeclaration.errorCollection.merge(override.errorCollection),
		};
	}
}
