import { NewInputFieldDeclarationParser } from '../parsers/newInputFieldParser/InputFieldParser';
import { ViewFieldDeclarationParser } from '../parsers/ViewFieldDeclarationParser';
import { BindTargetParser } from '../parsers/BindTargetParser';
import { IPlugin } from '../IPlugin';

export interface IAPI {
	plugin: IPlugin;
	newInputFieldParser: NewInputFieldDeclarationParser;
	viewFieldParser: ViewFieldDeclarationParser;
	bindTargetParser: BindTargetParser;
}
