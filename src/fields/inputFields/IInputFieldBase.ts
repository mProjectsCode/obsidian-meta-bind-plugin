import { type InputFieldArgumentType } from '../../config/FieldConfigs';
import { type InputFieldArgumentMapType } from '../fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import { type IPlugin } from '../../IPlugin';
import { type BindTargetDeclaration } from '../../parsers/bindTargetParser/BindTargetDeclaration';

export interface IInputFieldBase {
	readonly plugin: IPlugin;

	getUuid(): string;

	getFilePath(): string;

	getBindTarget(): BindTargetDeclaration | undefined;

	getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[];

	getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined;

	load(): void;

	unload(): void;
}
