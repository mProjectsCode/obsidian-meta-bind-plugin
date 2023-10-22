import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { type InputFieldArgumentConfig, type InputFieldArgumentType, type InputFieldType } from '../../parsers/inputFieldParser/InputFieldConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<InputFieldType, InputFieldArgumentType, InputFieldArgumentConfig> {}
