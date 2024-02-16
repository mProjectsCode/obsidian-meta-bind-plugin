import { ErrorCollection } from '../utils/errors/ErrorCollection';
import {
	type UnvalidatedFieldArgument,
	type UnvalidatedInputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type InputFieldArgumentType, type InputFieldType } from '../config/FieldConfigs';
import { PROP_ACCESS_TYPE } from '../utils/prop/PropAccess';
import { type UnvalidatedBindTargetDeclaration } from '../parsers/bindTargetParser/BindTargetDeclaration';
import { type IPlugin } from '../IPlugin';

export class InputFieldAPI {
	private readonly plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Create an input field declaration from a type and input field arguments.
	 *
	 * @param inputFieldType
	 * @param inputFieldArguments
	 */
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

	/**
	 * Create an input field declaration from a string by parsing it.
	 *
	 * @param fullDeclaration
	 */
	public createInputFieldDeclarationFromString(fullDeclaration: string): UnvalidatedInputFieldDeclaration {
		return this.plugin.api.inputFieldParser.parseStringWithoutValidation(fullDeclaration);
	}

	/**
	 * Set the input field type of an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param inputFieldType
	 */
	public setType(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldType: InputFieldType,
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.inputFieldType = { value: inputFieldType };

		return unvalidatedDeclaration;
	}

	/**
	 * Set the input field arguments of an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param inputFieldArguments
	 */
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

	/**
	 * Add one or multiple input field arguments to an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param inputFieldArguments
	 */
	public addArgument(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		inputFieldArguments:
			| { name: InputFieldArgumentType; value: string[] }[]
			| { name: InputFieldArgumentType; value: string[] },
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

	/**
	 * Set the bind target file of an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param bindTargetFile
	 */
	public setBindTargetFile(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		bindTargetFile: string,
	): UnvalidatedInputFieldDeclaration {
		if (unvalidatedDeclaration.bindTarget) {
			unvalidatedDeclaration.bindTarget.storagePath = { value: bindTargetFile };
		} else {
			unvalidatedDeclaration.bindTarget = {
				storagePath: { value: bindTargetFile },
				storageProp: [],
				listenToChildren: false,
			};
		}

		return unvalidatedDeclaration;
	}

	/**
	 * Set the bind target metadata path of an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param bindTargetMetadataField
	 */
	public setBindTargetMetadataField(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		bindTargetMetadataField: string | string[],
	): UnvalidatedInputFieldDeclaration {
		if (typeof bindTargetMetadataField === 'string') {
			bindTargetMetadataField = [bindTargetMetadataField];
		}

		if (unvalidatedDeclaration.bindTarget) {
			unvalidatedDeclaration.bindTarget.storageProp = bindTargetMetadataField.map(x => ({
				type: PROP_ACCESS_TYPE.OBJECT,
				prop: { value: x },
			}));
		} else {
			unvalidatedDeclaration.bindTarget = {
				storagePath: undefined,
				storageProp: bindTargetMetadataField.map(x => ({
					type: PROP_ACCESS_TYPE.OBJECT,
					prop: { value: x },
				})),
				listenToChildren: false,
			};
		}

		return unvalidatedDeclaration;
	}

	/**
	 * Set the template of an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 * @param templateName
	 */
	public setTemplateName(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		templateName: string,
	): UnvalidatedInputFieldDeclaration {
		unvalidatedDeclaration.templateName = { value: templateName };
		return unvalidatedDeclaration;
	}

	/**
	 * Apply a set template to an input field declaration.
	 *
	 * @param unvalidatedDeclaration
	 */
	public applyTemplate(unvalidatedDeclaration: UnvalidatedInputFieldDeclaration): UnvalidatedInputFieldDeclaration {
		return this.plugin.api.inputFieldParser.applyTemplate(unvalidatedDeclaration);
	}

	/**
	 * Get an input field template by name.
	 *
	 * @param templateName
	 */
	public getTemplate(templateName: string): Readonly<UnvalidatedInputFieldDeclaration> | undefined {
		return this.plugin.api.inputFieldParser.getTemplate(templateName);
	}

	/**
	 * Merge two input field declarations.
	 *
	 * @param unvalidatedDeclaration
	 * @param override
	 */
	public merge(
		unvalidatedDeclaration: UnvalidatedInputFieldDeclaration,
		override: UnvalidatedInputFieldDeclaration,
	): UnvalidatedInputFieldDeclaration {
		let bindTarget: UnvalidatedBindTargetDeclaration | undefined;

		if (unvalidatedDeclaration.bindTarget === undefined) {
			bindTarget = override.bindTarget;
		} else {
			bindTarget = unvalidatedDeclaration.bindTarget;
			if (override.bindTarget?.storagePath !== undefined) {
				bindTarget.storagePath = override.bindTarget.storagePath;
			}
			if (override.bindTarget?.storageProp !== undefined) {
				bindTarget.storageProp = override.bindTarget.storageProp;
			}
		}

		return {
			fullDeclaration: override.fullDeclaration,
			inputFieldType: override.inputFieldType ?? unvalidatedDeclaration.inputFieldType,
			bindTarget: bindTarget,
			arguments: override.arguments
				.concat(unvalidatedDeclaration.arguments)
				.reduce<UnvalidatedFieldArgument[]>((arr, currentValue) => {
					// filter out duplicates
					if (arr.find(x => x.name === currentValue.name) === undefined) {
						arr.push(currentValue);
					}
					return arr;
				}, []),
			errorCollection: new ErrorCollection('input field declaration')
				.merge(unvalidatedDeclaration.errorCollection)
				.merge(override.errorCollection),
		};
	}
}
