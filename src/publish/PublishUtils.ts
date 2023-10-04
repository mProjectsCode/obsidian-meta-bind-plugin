import { InputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { InputFieldArgumentType, InputFieldType } from '../inputFields/InputFieldConfigs';

/**
 * Used for publish.
 * Returns the default value for the input field declaration, for if it's bind target is unavailable.
 *
 * @param declaration
 */
export function getPublishDefaultValue(declaration: InputFieldDeclaration): unknown {
	const placeholderString: string = declaration.argumentContainer.get(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'placeholder';

	if (declaration.inputFieldType === InputFieldType.TOGGLE) {
		const offArgument = declaration.argumentContainer.get(InputFieldArgumentType.OFF_VALUE);
		return offArgument ? offArgument.value : false;
	} else if (declaration.inputFieldType === InputFieldType.SLIDER) {
		const minArgument = declaration.argumentContainer.get(InputFieldArgumentType.MIN_VALUE);
		return minArgument ? minArgument.value : 0;
	} else if (declaration.inputFieldType === InputFieldType.TEXT) {
		return placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.TEXT_AREA_DEPRECATED || declaration.inputFieldType === InputFieldType.TEXT_AREA) {
		return placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.SELECT) {
		const firstOptionArgument = declaration.argumentContainer.get(InputFieldArgumentType.OPTION);
		return firstOptionArgument ? firstOptionArgument.value : placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.MULTI_SELECT_DEPRECATED || declaration.inputFieldType === InputFieldType.MULTI_SELECT) {
		const firstOptionArgument = declaration.argumentContainer.get(InputFieldArgumentType.OPTION);
		return firstOptionArgument ? firstOptionArgument.value : placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.DATE) {
		return '1970-01-01';
	} else if (declaration.inputFieldType === InputFieldType.TIME) {
		return '00:00';
	} else if (declaration.inputFieldType === InputFieldType.DATE_PICKER_DEPRECATED || declaration.inputFieldType === InputFieldType.DATE_PICKER) {
		return '1970-01-01';
	} else if (declaration.inputFieldType === InputFieldType.NUMBER) {
		return 0;
	} else if (declaration.inputFieldType === InputFieldType.SUGGESTER) {
		const firstOptionArgument = declaration.argumentContainer.get(InputFieldArgumentType.OPTION);
		return firstOptionArgument ? firstOptionArgument.value : placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.EDITOR) {
		return placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.IMAGE_SUGGESTER) {
		return placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.PROGRESS_BAR) {
		const minArgument = declaration.argumentContainer.get(InputFieldArgumentType.MIN_VALUE);
		return minArgument ? minArgument.value : 0;
	} else if (declaration.inputFieldType === InputFieldType.INLINE_SELECT) {
		const firstOptionArgument = declaration.argumentContainer.get(InputFieldArgumentType.OPTION);
		return firstOptionArgument ? firstOptionArgument.value : placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.LIST) {
		return placeholderString;
	} else if (declaration.inputFieldType === InputFieldType.LIST_SUGGESTER) {
		const firstOptionArgument = declaration.argumentContainer.get(InputFieldArgumentType.OPTION);
		return firstOptionArgument ? firstOptionArgument.value : placeholderString;
	}

	return placeholderString;
}
