import { AbstractViewField } from '../AbstractViewField';
import { type ViewFieldDeclaration } from '../../../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldMDRC, type ViewFieldVariable } from '../../../renderChildren/ViewFieldMDRC';
import { ErrorLevel, MetaBindExpressionError } from '../../../utils/errors/MetaBindErrors';
import { Signal } from '../../../utils/Signal';
import { getUUID } from '../../../utils/Utils';
import { compile as MathJsCompile, type EvalFunction } from 'mathjs';

export class MathVF extends AbstractViewField {
	container?: HTMLElement;
	expression?: EvalFunction;
	expressionStr?: string;
	hasError: boolean;

	hidden: boolean;

	constructor(renderChild: ViewFieldMDRC) {
		super(renderChild);

		this.hidden = false;

		this.hasError = false;
	}

	public buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[] {
		let varCounter = 0;
		this.expressionStr = '';

		const variables: ViewFieldVariable[] = [];

		for (const entry of declaration.templateDeclaration ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					inputSignal: new Signal<unknown>(undefined),
					uuid: getUUID(),
					contextName: `MB_VAR_${varCounter}`,
				};

				variables.push(variable);

				this.expressionStr += variable.contextName;
				varCounter += 1;
			} else {
				this.expressionStr += entry;
			}
		}

		this.expression = MathJsCompile(this.expressionStr);

		return variables;
	}

	protected _render(_container: HTMLElement): void {}

	protected _update(container: HTMLElement, text: string): void {
		// console.log('hasError', this.hasError);
		if (this.hasError) {
			container.addClass('mb-error');
		} else {
			container.removeClass('mb-error');
		}
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

	computeValue(variables: ViewFieldVariable[]): unknown {
		this.hasError = false;

		if (!this.expression) {
			return this.handleComputeError(
				new MetaBindExpressionError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'failed to evaluate expression',
					cause: 'expression is undefined',
				}),
			);
		}

		const context = this.buildContext(variables);
		try {
			// eslint-disable-next-line
			return this.expression.evaluate(context);
		} catch (e) {
			if (e instanceof Error) {
				return this.handleComputeError(
					new MetaBindExpressionError({
						errorLevel: ErrorLevel.ERROR,
						effect: `failed to evaluate expression`,
						cause: e,
						context: {
							expression: this.expressionStr,
							context: context,
						},
					}),
				);
			} else {
				return this.handleComputeError(
					new Error('failed to evaluate js expression because of: unexpected thrown value'),
				);
			}
		}
	}

	public getDefaultDisplayValue(): string {
		return '';
	}

	private handleComputeError(e: Error): string {
		this.hasError = true;
		console.warn(e);
		return e.message;
	}
}
