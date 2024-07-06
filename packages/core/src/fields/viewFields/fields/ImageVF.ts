import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import { type ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';
import {
	ErrorLevel,
	MetaBindExpressionError,
	MetaBindValidationError,
} from 'packages/core/src/utils/errors/MetaBindErrors';
import ImageGrid from 'packages/core/src/utils/components/ImageGrid.svelte';

export class ImageVF extends AbstractViewField {
	component?: ImageGrid;

	constructor(mountable: ViewFieldMountable) {
		super(mountable);
	}

	protected buildVariables(): void {
		// filter out empty strings
		const entries: (string | BindTargetDeclaration)[] = this.mountable
			.getDeclaration()
			.templateDeclaration.filter(x => (typeof x === 'string' ? x : true));

		if (entries.length !== 1) {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'image view filed only supports exactly a single bind target and not text content',
			});
		}

		const firstEntry = entries[0];
		if (typeof firstEntry === 'string') {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'image view filed only supports exactly a single bind target and not text content',
			});
		}

		firstEntry.listenToChildren = true;

		this.variables = [
			{
				bindTargetDeclaration: firstEntry,
				inputSignal: new Signal<unknown>(undefined),
				uuid: getUUID(),
				contextName: `MB_VAR_0`,
			},
		];
	}

	protected computeValue(): string {
		if (this.variables.length !== 1) {
			throw new MetaBindExpressionError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'failed to evaluate image view field',
				cause: 'there should be exactly one variable',
			});
		}

		const variable = this.variables[0];
		const content = variable.inputSignal.get();

		// we want the return value to be a human-readable string, since someone could save this to the frontmatter
		if (typeof content === 'string') {
			return MDLinkParser.toLinkString(content);
		} else if (Array.isArray(content)) {
			const strings = content.filter(x => typeof x === 'string') as string[];
			return strings
				.map(x => MDLinkParser.toLinkString(x))
				.filter(x => x !== '')
				.join(', ');
		} else {
			return '';
		}
	}

	protected onInitialRender(container: HTMLElement): void {
		this.component = new ImageGrid({
			target: container,
			props: {
				images: [],
				plugin: this.mountable.plugin,
			},
		});
	}

	protected async onRerender(container: HTMLElement, text: string): Promise<void> {
		const linkList = MDLinkParser.parseLinkList(text);
		this.component?.$destroy();
		this.component = new ImageGrid({
			target: container,
			props: {
				images: linkList.map(x => x.target),
				plugin: this.mountable.plugin,
			},
		});
	}

	protected onUnmount(): void {
		super.onUnmount();

		this.component?.$destroy();
	}
}
