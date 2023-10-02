import { ClassInputFieldArgument } from './arguments/ClassInputFieldArgument';
import { AddLabelsInputFieldArgument } from './arguments/AddLabelsInputFieldArgument';
import { MinValueInputFieldArgument } from './arguments/MinValueInputFieldArgument';
import { MaxValueInputFieldArgument } from './arguments/MaxValueInputFieldArgument';
import { OptionInputFieldArgument } from './arguments/OptionInputFieldArgument';
import { TitleInputFieldArgument } from './arguments/TitleInputFieldArgument';
import { OptionQueryInputFieldArgument } from './arguments/OptionQueryInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { ShowcaseInputFieldArgument } from './arguments/ShowcaseInputFieldArgument';
import { OffValueInputFieldArgument } from './arguments/OffValueInputFieldArgument';
import { OnValueInputFieldArgument } from './arguments/OnValueInputFieldArgument';
import { DefaultValueInputFieldArgument } from './arguments/DefaultValueInputFieldArgument';
import { PlaceholderInputFieldArgument } from './arguments/PlaceholderInputFieldArgument';
import { InputFieldArgumentType } from '../inputFields/InputFieldConfigs';
import { UseLinksInputFieldArgument } from './arguments/UseLinksInputFieldArgument';

export class InputFieldArgumentFactory {
	static createInputFieldArgument(argumentIdentifier: string): AbstractInputFieldArgument {
		if (argumentIdentifier === InputFieldArgumentType.CLASS) {
			return new ClassInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.ADD_LABELS) {
			return new AddLabelsInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.MIN_VALUE) {
			return new MinValueInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.MAX_VALUE) {
			return new MaxValueInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.OPTION) {
			return new OptionInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.TITLE) {
			return new TitleInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.OPTION_QUERY) {
			return new OptionQueryInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.SHOWCASE) {
			return new ShowcaseInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.OFF_VALUE) {
			return new OffValueInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.ON_VALUE) {
			return new OnValueInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.DEFAULT_VALUE) {
			return new DefaultValueInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.PLACEHOLDER) {
			return new PlaceholderInputFieldArgument();
		} else if (argumentIdentifier === InputFieldArgumentType.USE_LINKS) {
			return new UseLinksInputFieldArgument();
		} else {
			throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not crate input field argument', `unknown argument '${argumentIdentifier}'`);
		}
	}
}
