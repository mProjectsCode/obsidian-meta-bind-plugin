import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { type InputFieldArgumentConfig, type InputFieldArgumentType, type InputFieldType } from '../../parsers/GeneralConfigs';

export abstract class AbstractInputFieldArgument extends AbstractFieldArgument<InputFieldType, InputFieldArgumentType, InputFieldArgumentConfig> {}
