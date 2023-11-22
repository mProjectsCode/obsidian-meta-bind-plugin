import { type BindTargetDeclaration, type FullBindTarget } from '../../parsers/inputFieldParser/InputFieldDeclaration';
import { type InputFieldArgumentType } from '../../config/FieldConfigs';
import { type InputFieldArgumentMapType } from '../fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { type IPlugin } from '../../IPlugin';

export interface IInputFieldBase {
	readonly plugin: IPlugin;

	getUuid(): string;

	getFilePath(): string;

	isBound(): boolean;

	getBindTarget(): BindTargetDeclaration | undefined;

	getFullBindTarget(): FullBindTarget | undefined;

	getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[];

	getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined;

	load(): void;

	unload(): void;
}
