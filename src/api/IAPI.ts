import { NewInputFieldDeclarationParser } from '../parsers/newInputFieldParser/InputFieldParser';
import { ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { InputFieldAPI } from './InputFieldAPI';

export interface IAPI {
	readonly plugin: IPlugin;
	readonly newInputFieldParser: NewInputFieldDeclarationParser;
	readonly viewFieldParser: ViewFieldDeclarationParser;
	readonly bindTargetParser: BindTargetParser;
	readonly inputField: InputFieldAPI;
}
