import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import { ErrorLevel, MetaBindExpressionError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers, getUUID } from 'packages/core/src/utils/Utils';
import { compile as MathJsCompile, type EvalFunction } from 'mathjs';
import { parseLiteral } from 'packages/core/src/utils/Literal';
import { type ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import { type ViewFieldBase } from 'packages/core/src/fields/viewFields/ViewFieldBase';

export class MathVF extends AbstractViewField {
	container?: HTMLElement;
	expression?: EvalFunction;
	expressionStr?: string;
	hasError: boolean;

	hidden: boolean;

	constructor(base: ViewFieldBase) {
		super(base);

		this.hidden = false;

		this.hasError = false;
	}

	protected buildVariables(): void {
		let varCounter = 0;
		this.expressionStr = '';

		this.variables = [];

		for (const entry of this.base.getDeclaration().templateDeclaration ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					inputSignal: new Signal<unknown>(undefined),
					uuid: getUUID(),
					contextName: `MB_VAR_${varCounter}`,
				};

				this.variables.push(variable);

				this.expressionStr += variable.contextName;
				varCounter += 1;
			} else {
				this.expressionStr += entry;
			}
		}

		this.expression = MathJsCompile(this.expressionStr);
	}

	private buildMathJSContext(): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.inputSignal) {
				continue;
			}

			context[variable.contextName] = variable.inputSignal.get() ?? '';
		}

		return context;
	}

	protected computeValue(): unknown {
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

		const context = this.buildMathJSContext();
		try {
			// eslint-disable-next-line
			return parseLiteral(this.expression.evaluate(context)?.toString());
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

	protected onInitialRender(_container: HTMLElement): void {}

	protected onRerender(container: HTMLElement, text: string): void {
		// console.log('hasError', this.hasError);
		if (this.hasError) {
			DomHelpers.addClass(container, 'mb-error');
		} else {
			DomHelpers.removeClass(container, 'mb-error');
		}
		container.innerText = text;
	}

	private handleComputeError(e: Error): string {
		this.hasError = true;
		console.warn(e);
		return e.message;
	}
}
