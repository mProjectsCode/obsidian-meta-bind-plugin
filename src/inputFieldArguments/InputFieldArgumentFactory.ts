import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';
import { ClassInputFieldArgument } from './arguments/ClassInputFieldArgument';
import { AddLabelsInputFieldArgument } from './arguments/AddLabelsInputFieldArgument';
import { MinValueInputFieldArgument } from './arguments/MinValueInputFieldArgument';
import { MaxValueInputFieldArgument } from './arguments/MaxValueInputFieldArgument';
import { OptionInputFieldArgument } from './arguments/OptionInputFieldArgument';
import { TitleInputFieldArgument } from './arguments/TitleInputFieldArgument';
import { AlignRightInputFieldArgument } from './arguments/AlignRightInputFieldArgument';
import { OptionQueryInputFieldArgument } from './arguments/OptionQueryInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { ShowcaseInputFieldArgument } from './arguments/ShowcaseInputFieldArgument';
import { OffValueInputFieldArgument } from './arguments/OffValueInputFieldArgument';
import { OnValueInputFieldArgument } from './arguments/OnValueInputFieldArgument';
import { DefaultValueInputFieldArgument } from './arguments/DefaultValueInputFieldArgument';

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
		} else if (argumentIdentifier === InputFieldArgumentType.ALIGN_RIGHT) {
			return new AlignRightInputFieldArgument();
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
		} else {
			throw new MetaBindParsingError(ErrorLevel.ERROR, 'can not crate input field argument', `unknown argument '${argumentIdentifier}'`);
		}
	}
}
