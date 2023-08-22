import { ValidationGraph } from './ValidationGraph';
import { ComplexTreeLayout, TL_C_Enumeration, TL_C_Literal, TL_C_Loop, TL_C_Optional, TL_C_Or } from './treeLayout/ComplexTreeLayout';
import { PT_Element_Type } from '../ParsingTree';
import { InputFieldToken, InputFieldTokenType } from '../InputFieldTokenizer';

type FullDeclarationKeys = 'template' | 'declaration';
type TemplateFullDeclarationKeys = 'declaration';
type DeclarationKeys = 'type' | 'arguments' | BindTargetKeys;
type PartialDeclarationKeys = 'type' | 'arguments' | BindTargetKeys;
type TemplateNameKeys = 'templateName';
type ArgumentsKeys = 'arguments' | 'name' | 'value';

type BindTargetKeys = 'bindTargetSeparator' | 'bindTargetFile' | 'bindTarget';

export class InputFieldValidationGraphSupplier {
	public readonly fullDeclarationValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, FullDeclarationKeys>;
	public readonly templateFullDeclarationValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, TemplateFullDeclarationKeys>;
	public readonly declarationValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, DeclarationKeys>;
	public readonly partialDeclarationValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, PartialDeclarationKeys>;
	public readonly templateNameValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, TemplateNameKeys>;
	public readonly argumentsValidationGraph: ValidationGraph<InputFieldTokenType, InputFieldToken, ArgumentsKeys>;

	constructor() {
		// HELPERS
		const inputFieldType_TL_C_Element: TL_C_Literal<InputFieldTokenType, InputFieldToken, 'type'> = new TL_C_Literal(
			PT_Element_Type.LITERAL,
			InputFieldTokenType.WORD,
			undefined,
			'type'
		);
		const arguments_TL_C_Element: TL_C_Literal<InputFieldTokenType, InputFieldToken, 'arguments'> = new TL_C_Literal(
			PT_Element_Type.CLOSURE,
			InputFieldTokenType.L_PAREN,
			undefined,
			'arguments'
		);
		const bindTarget_TL_C_Elements: ComplexTreeLayout<InputFieldTokenType, InputFieldToken, BindTargetKeys> = [
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.COLON, undefined, 'bindTargetSeparator'), // bind target separator
			new TL_C_Optional([
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTargetFile'), // file
				new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.HASHTAG), // hashtag
			] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, BindTargetKeys>), // optional file and hashtag
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'bindTarget'), // first bind target metadata path part
			new TL_C_Loop(
				[
					new TL_C_Or([
						[new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD)],
						[new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE)],
					] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, BindTargetKeys>[]), // either literal or closure or none, in a loop
				] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, BindTargetKeys>,
				0,
				-1
			), // the other bind target metadata path part
		];

		// FULL DECLARATION
		// literal.closure or literal.closure.closure
		this.fullDeclarationValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, 'INPUT'),
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'template')]),
			new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'declaration'),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, FullDeclarationKeys>);
		this.fullDeclarationValidationGraph.optimize();

		// TEMPLATE - FULL DECLARATION
		this.templateFullDeclarationValidationGraph = new ValidationGraph([
			new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, 'INPUT'),
			new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_SQUARE, undefined, 'declaration'),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, TemplateFullDeclarationKeys>);
		this.templateFullDeclarationValidationGraph.optimize();

		// DECLARATION
		this.declarationValidationGraph = new ValidationGraph([
			inputFieldType_TL_C_Element,
			new TL_C_Optional([arguments_TL_C_Element]), // optional arguments
			new TL_C_Optional(bindTarget_TL_C_Elements),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, DeclarationKeys>);
		this.declarationValidationGraph.optimize();

		// PARTIAL DECLARATION
		this.partialDeclarationValidationGraph = new ValidationGraph([
			new TL_C_Optional([inputFieldType_TL_C_Element]), // input field type
			new TL_C_Optional([arguments_TL_C_Element]), // optional arguments
			new TL_C_Optional(bindTarget_TL_C_Elements),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, PartialDeclarationKeys>);
		this.partialDeclarationValidationGraph.optimize();

		// TEMPLATE NAME
		this.templateNameValidationGraph = new ValidationGraph([
			new TL_C_Optional([new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'templateName')]),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, TemplateNameKeys>);
		this.templateNameValidationGraph.optimize();

		// ARGUMENTS
		this.argumentsValidationGraph = new ValidationGraph([
			new TL_C_Enumeration(
				[
					new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.WORD, undefined, 'name'),
					new TL_C_Optional([new TL_C_Literal(PT_Element_Type.CLOSURE, InputFieldTokenType.L_PAREN, undefined, 'value')]),
				] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, ArgumentsKeys>,
				[new TL_C_Literal(PT_Element_Type.LITERAL, InputFieldTokenType.COMMA)],
				'arguments'
			),
		] as ComplexTreeLayout<InputFieldTokenType, InputFieldToken, ArgumentsKeys>);
		this.argumentsValidationGraph.optimize();
	}
}
