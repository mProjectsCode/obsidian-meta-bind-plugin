import { AbstractFieldArgument } from '../AbstractFieldArgument';
import { type ViewFieldArgumentConfig, type ViewFieldArgumentType, type ViewFieldType } from '../../parsers/viewFieldParser/ViewFieldConfigs';

export abstract class AbstractViewFieldArgument extends AbstractFieldArgument<ViewFieldType, ViewFieldArgumentType, ViewFieldArgumentConfig> {}
