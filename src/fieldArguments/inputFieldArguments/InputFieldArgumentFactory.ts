import { ClassInputFieldArgument } from './arguments/ClassInputFieldArgument';
import { AddLabelsInputFieldArgument } from './arguments/AddLabelsInputFieldArgument';
import { MinValueInputFieldArgument } from './arguments/MinValueInputFieldArgument';
import { MaxValueInputFieldArgument } from './arguments/MaxValueInputFieldArgument';
import { OptionInputFieldArgument } from './arguments/OptionInputFieldArgument';
import { TitleInputFieldArgument } from './arguments/TitleInputFieldArgument';
import { OptionQueryInputFieldArgument } from './arguments/OptionQueryInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../../utils/errors/MetaBindErrors';
import { ShowcaseInputFieldArgument } from './arguments/ShowcaseInputFieldArgument';
import { OffValueInputFieldArgument } from './arguments/OffValueInputFieldArgument';
import { OnValueInputFieldArgument } from './arguments/OnValueInputFieldArgument';
import { DefaultValueInputFieldArgument } from './arguments/DefaultValueInputFieldArgument';
import { PlaceholderInputFieldArgument } from './arguments/PlaceholderInputFieldArgument';
import { UseLinksInputFieldArgument } from './arguments/UseLinksInputFieldArgument';
import { StepSizeValueInputFieldArgument } from './arguments/StepSizeValueInputFieldArgument';
import { LimitInputFieldArgument } from './arguments/LimitInputFieldArgument';
import { InputFieldArgumentType } from '../../parsers/GeneralConfigs';

export const INPUT_FIELD_ARGUMENT_MAP = {
	[InputFieldArgumentType.CLASS]: ClassInputFieldArgument,
	[InputFieldArgumentType.ADD_LABELS]: AddLabelsInputFieldArgument,
	[InputFieldArgumentType.MIN_VALUE]: MinValueInputFieldArgument,
	[InputFieldArgumentType.MAX_VALUE]: MaxValueInputFieldArgument,
	[InputFieldArgumentType.STEP_SIZE]: StepSizeValueInputFieldArgument,
	[InputFieldArgumentType.OPTION]: OptionInputFieldArgument,
	[InputFieldArgumentType.TITLE]: TitleInputFieldArgument,
	[InputFieldArgumentType.OPTION_QUERY]: OptionQueryInputFieldArgument,
	[InputFieldArgumentType.SHOWCASE]: ShowcaseInputFieldArgument,
	[InputFieldArgumentType.OFF_VALUE]: OffValueInputFieldArgument,
	[InputFieldArgumentType.ON_VALUE]: OnValueInputFieldArgument,
	[InputFieldArgumentType.DEFAULT_VALUE]: DefaultValueInputFieldArgument,
	[InputFieldArgumentType.PLACEHOLDER]: PlaceholderInputFieldArgument,
	[InputFieldArgumentType.USE_LINKS]: UseLinksInputFieldArgument,
	[InputFieldArgumentType.LIMIT]: LimitInputFieldArgument,
} as const;

export type InputFieldArgumentMapType<T extends InputFieldArgumentType> = T extends keyof typeof INPUT_FIELD_ARGUMENT_MAP
	? InstanceType<(typeof INPUT_FIELD_ARGUMENT_MAP)[T]>
	: undefined;

export type InputFieldArgumentConstructorMapType<T extends InputFieldArgumentType> = T extends keyof typeof INPUT_FIELD_ARGUMENT_MAP
	? (typeof INPUT_FIELD_ARGUMENT_MAP)[T]
	: undefined;

export class InputFieldArgumentFactory {
	static createInputFieldArgument(argumentIdentifier: InputFieldArgumentType): NonNullable<InputFieldArgumentMapType<typeof argumentIdentifier>> {
		if (argumentIdentifier in INPUT_FIELD_ARGUMENT_MAP) {
			// @ts-ignore Thanks to the `if` we know that the object has the property
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const inputFieldConstructor: InputFieldArgumentConstructorMapType<typeof argumentIdentifier> = INPUT_FIELD_ARGUMENT_MAP[argumentIdentifier];

			if (inputFieldConstructor) {
				return new inputFieldConstructor();
			}
		}

		throw new MetaBindParsingError({
			errorLevel: ErrorLevel.WARNING,
			effect: 'can not crate input field argument',
			cause: `unknown argument '${argumentIdentifier}'`,
		});
	}
}
