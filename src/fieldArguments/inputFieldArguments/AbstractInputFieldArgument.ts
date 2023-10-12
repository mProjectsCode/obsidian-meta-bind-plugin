import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentType, InputFieldType } from '../../parsers/inputFieldParser/InputFieldConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<InputFieldType, InputFieldArgumentType, InputFieldArgumentConfig> {}
