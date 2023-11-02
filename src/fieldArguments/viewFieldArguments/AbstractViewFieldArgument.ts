import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { ViewFieldArgumentConfig, ViewFieldArgumentType, ViewFieldType } from '../../parsers/GeneralConfigs';

export abstract class AbstractViewFieldArgument extends AbstractFieldArgument<ViewFieldType, ViewFieldArgumentType, ViewFieldArgumentConfig> {}
