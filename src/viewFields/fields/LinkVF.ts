import { AbstractViewField } from '../AbstractViewField';
import { type ViewFieldMDRC, type ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';
import { type ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { Signal } from '../../utils/Signal';
import { getUUID } from '../../utils/Utils';
import { ErrorLevel, MetaBindExpressionError, MetaBindValidationError } from '../../utils/errors/MetaBindErrors';
import { type BindTargetDeclaration } from '../../parsers/inputFieldParser/InputFieldDeclaration';
import { isMdLink, parseMdLinkList } from '../../parsers/MarkdownLinkParser';
import LinkListComponent from '../../utils/components/LinkListComponent.svelte';

export class LinkVF extends AbstractViewField {
	component?: LinkListComponent;

	constructor(renderChild: ViewFieldMDRC) {
		super(renderChild);
	}

	public buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[] {
		// filter out empty strings
		const entries: (string | BindTargetDeclaration)[] = declaration.templateDeclaration.filter(x =>
			typeof x === 'string' ? x : true,
		);

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

		const variable: ViewFieldVariable = {
			bindTargetDeclaration: firstEntry,
			inputSignal: new Signal<unknown>(undefined),
			uuid: getUUID(),
			contextName: `MB_VAR_0`,
		};

		return [variable];
	}

	protected _render(container: HTMLElement): void {
		this.component = new LinkListComponent({
			target: container,
			props: {
				mdLinkList: [],
			},
		});
	}

	protected async _update(container: HTMLElement, text: string): Promise<void> {
		const linkList = parseMdLinkList(text);
		this.component = new LinkListComponent({
			target: container,
			props: {
				mdLinkList: linkList,
			},
		});
	}

	public destroy(): void {
		this.component?.$destroy();
	}

	computeValue(variables: ViewFieldVariable[]): string {
		if (variables.length !== 1) {
			throw new MetaBindExpressionError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: 'failed to evaluate link view field',
				cause: 'there should be exactly one variable',
			});
		}

		const variable = variables[0];
		const content = variable.inputSignal.get();

		// we want the return value to be a human-readable string, since someone could save this to the frontmatter
		if (typeof content === 'string') {
			return this.convertToLink(content);
		} else if (Array.isArray(content)) {
			const strings = content.filter(x => typeof x === 'string') as string[];
			return strings
				.map(x => this.convertToLink(x))
				.filter(x => x !== '')
				.join(', ');
		} else {
			return '';
		}
	}

	convertToLink(str: string): string {
		if (isMdLink(str)) {
			return str;
		} else if (isMdLink(`[[${str}]]`)) {
			return `[[${str}]]`;
		} else if (this.getUrl(str)) {
			const url = this.getUrl(str)!;
			return `[${url.hostname}](${str})`;
		} else {
			return '';
		}
	}

	getUrl(str: string): URL | undefined {
		try {
			return new URL(str);
		} catch (e) {
			return undefined;
		}
	}

	public getDefaultDisplayValue(): string {
		return '';
	}
}
