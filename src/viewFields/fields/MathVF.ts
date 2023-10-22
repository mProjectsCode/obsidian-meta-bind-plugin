import { AbstractViewField } from '../AbstractViewField';
import { type ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldMDRC, type ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';
import { ErrorLevel, MetaBindExpressionError } from '../../utils/errors/MetaBindErrors';
import * as MathJs from 'mathjs';
import { Signal } from '../../utils/Signal';

export class MathVF extends AbstractViewField {
	container?: HTMLElement;
	expression?: MathJs.EvalFunction;
	expressionStr?: string;

	hidden: boolean;

	constructor(renderChild: ViewFieldMDRC) {
		super(renderChild);

		this.hidden = false;
	}

	public buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[] {
		let varCounter = 0;
		this.expressionStr = '';

		const variables: ViewFieldVariable[] = [];

		for (const entry of declaration.templateDeclaration ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					inputSignal: new Signal<any>(undefined),
					uuid: self.crypto.randomUUID(),
					contextName: `MB_VAR_${varCounter}`,
				};

				variables.push(variable);

				this.expressionStr += variable.contextName;
				varCounter += 1;
			} else {
				this.expressionStr += entry;
			}
		}

		this.expression = MathJs.compile(this.expressionStr);

		return variables;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _render(container: HTMLElement): void {}

	protected _update(container: HTMLElement, text: string): void {
		container.innerText = text;
	}

	public destroy(): void {}

	buildContext(variables: ViewFieldVariable[]): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of variables ?? []) {
			if (!variable.contextName || !variable.inputSignal) {
				continue;
			}

			context[variable.contextName] = variable.inputSignal.get() ?? '';
		}

		return context;
	}

	async computeValue(variables: ViewFieldVariable[]): Promise<string> {
		if (!this.expression) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, 'failed to evaluate expression', 'expression is undefined');
		}

		const context = this.buildContext(variables);
		try {
			return this.expression.evaluate(context) as Promise<string>;
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindExpressionError(ErrorLevel.ERROR, `failed to evaluate expression`, e, {
					expression: this.expressionStr,
					context: context,
				});
			} else {
				throw new Error('failed to evaluate js expression because of: unexpected thrown value');
			}
		}
	}

	public getDefaultDisplayValue(): string {
		return '';
	}
}
