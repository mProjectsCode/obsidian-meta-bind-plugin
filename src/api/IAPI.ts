import { InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';
import { InputFieldAPI } from './InputFieldAPI';
import { NewInputFieldFactory } from '../inputFields/_new/NewInputFieldFactory';

export interface IAPI {
	readonly plugin: IPlugin;
	readonly inputField: InputFieldAPI;

	readonly inputFieldParser: InputFieldDeclarationParser;
	readonly viewFieldParser: ViewFieldDeclarationParser;
	readonly bindTargetParser: BindTargetParser;
}
