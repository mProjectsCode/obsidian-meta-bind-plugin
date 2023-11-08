import { AbstractViewField } from '../AbstractViewField';
import { type ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldMDRC, type ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';
import { Signal } from '../../utils/Signal';
import { ErrorLevel, MetaBindExpressionError } from '../../utils/errors/MetaBindErrors';
import { Component, MarkdownRenderer } from 'obsidian';
import { getUUID } from '../../utils/Utils';
import { ViewFieldArgumentType } from '../../parsers/GeneralConfigs';
import { stringifyUnknown } from '../../utils/Literal';

export class TextVF extends AbstractViewField {
	textParts?: (string | number)[];

	renderMarkdown: boolean;
	markdownComponent: Component;

	constructor(renderChild: ViewFieldMDRC) {
		super(renderChild);

		this.renderMarkdown = false;
		this.markdownComponent = new Component();
	}

	public buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[] {
		this.textParts = [];

		let varCounter = 0;
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

				this.textParts.push(varCounter);
				varCounter += 1;
			} else {
				this.textParts.push(entry);
			}
		}

		return variables;
	}

	protected _render(container: HTMLElement): void {
		this.renderMarkdown = this.renderChild.getArgument(ViewFieldArgumentType.RENDER_MARKDOWN)?.value ?? false;
		this.markdownComponent.load();

		if (this.renderMarkdown) {
			container.addClass('mb-view-markdown');
		}
	}

	protected async _update(container: HTMLElement, text: string): Promise<void> {
		if (this.renderMarkdown) {
			this.markdownComponent.unload();
			this.markdownComponent.load();

			await MarkdownRenderer.render(this.renderChild.plugin.app, text, container, this.renderChild.filePath, this.markdownComponent);
		} else {
			container.innerText = text;
		}
	}

	public destroy(): void {
		this.markdownComponent.unload();
	}

	computeValue(variables: ViewFieldVariable[]): string {
		if (!this.textParts) {
			throw new MetaBindExpressionError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to evaluate text view field',
				cause: 'content parts is undefined',
			});
		}

		return this.textParts
			.map<string>(x => {
				if (typeof x === 'number') {
					return stringifyUnknown(variables[x].inputSignal.get(), this.renderChild.plugin.settings.viewFieldDisplayNullAsEmpty);
				} else {
					return x;
				}
			})
			.join('');
	}

	public getDefaultDisplayValue(): string {
		return '';
	}
}
