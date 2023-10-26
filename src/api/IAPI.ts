import { type InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { type ViewFieldDeclarationParser } from '../parsers/viewFieldParser/ViewFieldDeclarationParser';
import { type BindTargetParser } from '../parsers/BindTargetParser';
import { type IPlugin } from '../IPlugin';
import { type InputFieldAPI } from './InputFieldAPI';

export interface IAPI {
	readonly plugin: IPlugin;
	readonly inputField: InputFieldAPI;

	readonly inputFieldParser: InputFieldDeclarationParser;
	readonly viewFieldParser: ViewFieldDeclarationParser;
	readonly bindTargetParser: BindTargetParser;
}
