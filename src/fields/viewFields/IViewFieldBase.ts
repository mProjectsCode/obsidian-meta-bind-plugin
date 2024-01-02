import { type ViewFieldArgumentType } from '../../config/FieldConfigs';
import { type IPlugin } from '../../IPlugin';
import { type ViewFieldArgumentMapType } from '../fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { type ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';

export interface IViewFieldBase {
	readonly plugin: IPlugin;

	getUuid(): string;

	getFilePath(): string;

	getDeclaration(): ViewFieldDeclaration;

	getArguments<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T>[];

	getArgument<T extends ViewFieldArgumentType>(name: T): ViewFieldArgumentMapType<T> | undefined;

	load(): void;

	unload(): void;
}
