import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { ViewFieldArgumentConfig, ViewFieldArgumentType, ViewFieldType } from '../../parsers/viewFieldParser/ViewFieldConfigs';

export abstract class AbstractViewFieldArgument extends AbstractFieldArgument<ViewFieldType, ViewFieldArgumentType, ViewFieldArgumentConfig> {}
