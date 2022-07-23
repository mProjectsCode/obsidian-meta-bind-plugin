import {ClassInputFieldArgument} from "./ClassInputFieldArgument";
import {MetaBindParsingError} from "../utils/Utils";
import {InputFieldArgumentType} from "../parsers/InputFieldDeclarationParser";
import {AddLabelsInputFieldArgument} from "./AddLabelsInputFieldArgument";
import {MinValueInputFieldArgument} from "./MinValueInputFieldArgument";
import {MaxValueInputFieldArgument} from "./MaxValueInputFieldArgument";
import {OptionInputFieldArgument} from "./OptionInputFieldArgument";
import {TitleInputFieldArgument} from "./TitleInputFieldArgument";


export class InputFieldArgumentFactory {
	static createInputFieldArgument(argumentIdentifier: string) {
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
		} else {
			throw new MetaBindParsingError(`unknown argument \'${argumentIdentifier}\'`);
		}
	}
}
