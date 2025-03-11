import { ViewFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import { ErrorLevel, MetaBindExpressionError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { stringifyUnknown } from 'packages/core/src/utils/Literal';
import { Signal } from 'packages/core/src/utils/Signal';
import { DomHelpers, getUUID } from 'packages/core/src/utils/Utils';

export class TextVF extends AbstractViewField<string> {
	textParts?: (string | ViewFieldVariable)[];
	renderMarkdown: boolean;
	markdownUnloadCallback?: () => void;

	constructor(mountable: ViewFieldMountable) {
		super(mountable);

		this.renderMarkdown = false;
	}

	protected buildVariables(): void {
		this.textParts = [];

		let varCounter = 0;
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

				this.textParts.push(variable);
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
				if (typeof x === 'string') {
					return x;
				}

				return stringifyUnknown(
					x.metadataSignal.get(),
					this.mountable.mb.getSettings().viewFieldDisplayNullAsEmpty,
				);
			})
			.join('');
	}

	protected mapValue(value: string): unknown {
		return value;
	}

	protected onInitialRender(container: HTMLElement): void {
		this.renderMarkdown = this.mountable.getArgument(ViewFieldArgumentType.RENDER_MARKDOWN)?.value ?? false;

		if (this.renderMarkdown) {
			DomHelpers.addClass(container, 'mb-view-markdown');
		}
	}

	protected async onRerender(container: HTMLElement, value: string | undefined): Promise<void> {
		const text = stringifyUnknown(value, this.mountable.mb.getSettings().viewFieldDisplayNullAsEmpty) ?? '';

		if (this.renderMarkdown) {
			this.markdownUnloadCallback?.();
			DomHelpers.empty(container);

			this.markdownUnloadCallback = await this.mountable.mb.internal.renderMarkdown(
				text,
				container,
				this.mountable.getFilePath(),
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
