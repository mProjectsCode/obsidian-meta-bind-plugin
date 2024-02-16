import { AbstractViewField } from '../AbstractViewField';
import { Signal } from '../../../utils/Signal';
import { getUUID } from '../../../utils/Utils';
import { ErrorLevel, MetaBindExpressionError, MetaBindValidationError } from '../../../utils/errors/MetaBindErrors';
import LinkListComponent from '../../../utils/components/LinkListComponent.svelte';
import { MDLinkParser } from '../../../parsers/MarkdownLinkParser';
import { type BindTargetDeclaration } from '../../../parsers/bindTargetParser/BindTargetDeclaration';
import { type ViewFieldBase } from '../ViewFieldBase';

export class LinkVF extends AbstractViewField {
	component?: LinkListComponent;

	constructor(base: ViewFieldBase) {
		super(base);
	}

	protected buildVariables(): void {
		// filter out empty strings
		const entries: (string | BindTargetDeclaration)[] = this.base
			.getDeclaration()
			.templateDeclaration.filter(x => (typeof x === 'string' ? x : true));

		if (entries.length !== 1) {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'link view filed only supports exactly a single bind target and not text content',
			});
		}

		const firstEntry = entries[0];
		if (typeof firstEntry === 'string') {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'link view filed only supports exactly a single bind target and not text content',
			});
		}

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
				effect: 'failed to evaluate link view field',
				cause: 'there should be exactly one variable',
			});
		}

		const variable = this.variables[0];
		const content = variable.inputSignal.get();

		// we want the return value to be a human-readable string, since someone could save this to the frontmatter
		if (typeof content === 'string') {
			return MDLinkParser.convertToLinkString(content);
		} else if (Array.isArray(content)) {
			const strings = content.filter(x => typeof x === 'string') as string[];
			return strings
				.map(x => MDLinkParser.convertToLinkString(x))
				.filter(x => x !== '')
				.join(', ');
		} else {
			return '';
		}
	}

	protected onInitialRender(container: HTMLElement): void {
		this.component = new LinkListComponent({
			target: container,
			props: {
				mdLinkList: [],
			},
		});
	}

	protected async onRerender(container: HTMLElement, text: string): Promise<void> {
		const linkList = MDLinkParser.parseLinkList(text);
		this.component = new LinkListComponent({
			target: container,
			props: {
				mdLinkList: linkList,
			},
		});
	}

	protected onUnmount(): void {
		super.onUnmount();

		this.component?.$destroy();
	}
}
