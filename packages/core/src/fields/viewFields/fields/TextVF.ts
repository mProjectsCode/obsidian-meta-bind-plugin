import { ViewFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import { type ViewFieldBase } from 'packages/core/src/fields/viewFields/ViewFieldBase';
import { type ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import { stringifyUnknown } from 'packages/core/src/utils/Literal';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers, getUUID } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindExpressionError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class TextVF extends AbstractViewField {
	textParts?: (string | number)[];
	renderMarkdown: boolean;
	markdownUnloadCallback?: () => void;

	constructor(base: ViewFieldBase) {
		super(base);

		this.renderMarkdown = false;
	}

	protected buildVariables(): void {
		this.textParts = [];

		let varCounter = 0;
		this.variables = [];

		for (const entry of this.base.getDeclaration().declarationArray ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					inputSignal: new Signal<unknown>(undefined),
					uuid: getUUID(),
					contextName: `MB_VAR_${varCounter}`,
				};

				this.variables.push(variable);

				this.textParts.push(varCounter);
				varCounter += 1;
			} else {
				this.textParts.push(entry);
			}
		}
	}

	protected computeValue(): string {
		if (!this.textParts) {
			throw new MetaBindExpressionError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'failed to evaluate text view field',
				cause: 'content parts is undefined',
			});
		}

		return this.textParts
			.map<string>(x => {
				if (typeof x === 'number') {
					return stringifyUnknown(
						this.variables[x].inputSignal.get(),
						this.base.plugin.settings.viewFieldDisplayNullAsEmpty,
					);
				} else {
					return x;
				}
			})
			.join('');
	}

	protected onInitialRender(container: HTMLElement): void {
		this.renderMarkdown = this.base.getArgument(ViewFieldArgumentType.RENDER_MARKDOWN)?.value ?? false;

		if (this.renderMarkdown) {
			DomHelpers.addClass(container, 'mb-view-markdown');
		}
	}

	protected async onRerender(container: HTMLElement, text: string): Promise<void> {
		if (this.renderMarkdown) {
			this.markdownUnloadCallback?.();

			this.markdownUnloadCallback = await this.base.plugin.internal.renderMarkdown(
				text,
				container,
				this.base.getFilePath(),
			);
		} else {
			container.innerText = text;
		}
	}

	protected onUnmount(): void {
		super.onUnmount();
		this.markdownUnloadCallback?.();
	}
}
