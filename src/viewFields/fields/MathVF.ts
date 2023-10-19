import { AbstractViewField } from '../AbstractViewField';
import { ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldMDRC, ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';
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
					writeSignal: new Signal<any>(undefined),
					uuid: self.crypto.randomUUID(),
					writeSignalListener: undefined,
					contextName: `MB_VAR_${varCounter}`,
					listenToChildren: false,
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

	protected _render(container: HTMLElement): void | Promise<void> {}

	async _update(container: HTMLElement, text: string): Promise<any> {
		container.innerText = text;
	}

	public destroy(): void {}

	buildContext(variables: ViewFieldVariable[]): Record<string, any> {
		const context: Record<string, any> = {};
		for (const variable of variables ?? []) {
			if (!variable.contextName || !variable.writeSignal) {
				continue;
			}

			context[variable.contextName] = variable.writeSignal.get() ?? '';
		}

		return context;
	}

	async computeValue(variables: ViewFieldVariable[]): Promise<string> {
		if (!this.expression) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, 'failed to evaluate expression', 'expression is undefined');
		}

		const context = this.buildContext(variables);
		try {
			return this.expression.evaluate(context);
		} catch (e: any) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, `failed to evaluate expression`, e, {
				expression: this.expressionStr,
				context: context,
			});
		}
	}

	public getDefaultDisplayValue(): string {
		return '';
	}
}
