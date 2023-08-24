import { Abstract_PT_Node, ParsingTree, PT_Closure, PT_Literal } from '../generalParser/ParsingTree';
import { InputFieldToken, InputFieldTokenType } from './InputFieldTokenizer';
import { ValidationContext, ValidationContextEntry, ValidationGraph } from '../generalParser/validationGraph/ValidationGraph';
import { StructureParserResult } from '../generalParser/StructureParser';

export type InputField_PT_Literal = PT_Literal<InputFieldTokenType, InputFieldToken>;
export type InputField_PT_Closure = PT_Closure<InputFieldTokenType, InputFieldToken>;
export type InputField_Abstract_PT_Node = Abstract_PT_Node<InputFieldTokenType, InputFieldToken>;
export type InputField_ValidationGraph<Key extends string> = ValidationGraph<InputFieldTokenType, InputFieldToken, Key>;
export type InputField_ValidationContext<Key extends string> = ValidationContext<InputFieldTokenType, InputFieldToken, Key>;
export type InputField_ValidationContextLiteralEntry = ValidationContextEntry<InputFieldTokenType, InputFieldToken, InputField_PT_Literal>;
export type InputField_ValidationContextClosureEntry = ValidationContextEntry<InputFieldTokenType, InputFieldToken, InputField_PT_Closure>;
export type InputField_StructureParserResult = StructureParserResult<InputFieldTokenType, InputFieldToken>;
export type InputField_ParsingTree = ParsingTree<InputFieldTokenType, InputFieldToken>;
