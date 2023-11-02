import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentType, InputFieldType } from '../../parsers/GeneralConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<InputFieldType, InputFieldArgumentType, InputFieldArgumentConfig> {}
