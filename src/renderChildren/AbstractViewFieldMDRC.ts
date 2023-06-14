import { AbstractMDRC } from './AbstractMDRC';

export abstract class AbstractViewFieldMDRC extends AbstractMDRC {
	abstract evaluateExpression(): Promise<string>;
}
