import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';
import { ClassInputFieldArgument } from './ClassInputFieldArgument';
import { AddLabelsInputFieldArgument } from './AddLabelsInputFieldArgument';
import { MinValueInputFieldArgument } from './MinValueInputFieldArgument';
import { MaxValueInputFieldArgument } from './MaxValueInputFieldArgument';
import { OptionInputFieldArgument } from './OptionInputFieldArgument';
import { TitleInputFieldArgument } from './TitleInputFieldArgument';
import { AlignRightInputFieldArgument } from './AlignRightInputFieldArgument';
import { OptionQueryInputFieldArgument } from './OptionQueryInputFieldArgument';
import { MetaBindParsingError } from '../utils/MetaBindErrors';
import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { ShowcaseInputFieldArgument } from './ShowcaseInputFieldArgument';

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
		} else {
			throw new MetaBindParsingError(`unknown argument '${argumentIdentifier}'`);
		}
	}
}
