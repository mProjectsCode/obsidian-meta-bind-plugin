import type { EvalFunction } from 'mathjs';
import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import { ErrorLevel, MetaBindExpressionError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parseLiteral, stringifyUnknown } from 'packages/core/src/utils/Literal';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers, getUUID } from 'packages/core/src/utils/Utils';

interface MathVFResult {
	value: unknown;
	error: boolean;
}

export class MathVF extends AbstractViewField<MathVFResult> {
	container?: HTMLElement;
	expression?: EvalFunction;
	expressionStr?: string;

	hidden: boolean;

	constructor(mountable: ViewFieldMountable) {
		super(mountable);

		this.hidden = false;
	}

	protected buildVariables(): void {
		let varCounter = 0;
		this.expressionStr = '';

		this.variables = [];

		for (const entry of this.mountable.getDeclaration().templateDeclaration ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					metadataSignal: new Signal<unknown>(undefined),
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

		this.expression = this.plugin.internal.math.compile(this.expressionStr);
	}

	private buildMathJSContext(): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.metadataSignal) {
				continue;
			}

			context[variable.contextName] = variable.metadataSignal.get() ?? '';
		}

		return context;
	}

	protected computeValue(): MathVFResult {
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
			const value: string = `${this.expression.evaluate(context)}`;
			return {
				value: parseLiteral(value),
				error: false,
			};
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
					new Error('failed to evaluate js expression because of unexpected thrown value'),
				);
			}
		}
	}

	protected mapValue(value: MathVFResult): unknown {
		return value.value;
	}

	protected onInitialRender(_container: HTMLElement): void {}

	protected onRerender(container: HTMLElement, value: MathVFResult | undefined): void {
		const text = stringifyUnknown(value?.value, this.mountable.plugin.settings.viewFieldDisplayNullAsEmpty) ?? '';

		if (value?.error) {
			DomHelpers.addClass(container, 'mb-error');
		} else {
			DomHelpers.removeClass(container, 'mb-error');
		}
		container.innerText = text;
	}

	private handleComputeError(e: Error): MathVFResult {
		console.warn(e);
		return {
			error: true,
			value: e.message,
		};
	}
}
