import { InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { InputFieldAPI } from './InputFieldAPI';

export interface IAPI {
	readonly plugin: IPlugin;
	readonly inputFieldParser: InputFieldDeclarationParser;
	readonly viewFieldParser: ViewFieldDeclarationParser;
	readonly bindTargetParser: BindTargetParser;
	readonly inputField: InputFieldAPI;
}
