import { ClassInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/ClassInputFieldArgument';
import { AddLabelsInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/AddLabelsInputFieldArgument';
import { MinValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/MinValueInputFieldArgument';
import { MaxValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/MaxValueInputFieldArgument';
import { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { TitleInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/TitleInputFieldArgument';
import { OptionQueryInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { ShowcaseInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/ShowcaseInputFieldArgument';
import { OffValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OffValueInputFieldArgument';
import { OnValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OnValueInputFieldArgument';
import { DefaultValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/DefaultValueInputFieldArgument';
import { PlaceholderInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/PlaceholderInputFieldArgument';
import { UseLinksInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import { StepSizeValueInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/StepSizeValueInputFieldArgument';
import { LimitInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/LimitInputFieldArgument';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';

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

export type InputFieldArgumentMapType<T extends InputFieldArgumentType> =
	T extends keyof typeof INPUT_FIELD_ARGUMENT_MAP ? InstanceType<(typeof INPUT_FIELD_ARGUMENT_MAP)[T]> : undefined;

export type InputFieldArgumentConstructorMapType<T extends InputFieldArgumentType> =
	T extends keyof typeof INPUT_FIELD_ARGUMENT_MAP ? (typeof INPUT_FIELD_ARGUMENT_MAP)[T] : undefined;

export class InputFieldArgumentFactory {
	static createInputFieldArgument(
		argumentIdentifier: InputFieldArgumentType,
	): NonNullable<InputFieldArgumentMapType<typeof argumentIdentifier>> {
		if (argumentIdentifier in INPUT_FIELD_ARGUMENT_MAP) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const inputFieldConstructor: InputFieldArgumentConstructorMapType<typeof argumentIdentifier> =
				// @ts-ignore Thanks to the `if` we know that the object has the property
				INPUT_FIELD_ARGUMENT_MAP[argumentIdentifier];

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
