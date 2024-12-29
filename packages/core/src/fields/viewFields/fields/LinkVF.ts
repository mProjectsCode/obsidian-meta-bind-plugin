import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import LinkListComponent from 'packages/core/src/utils/components/LinkListComponent.svelte';
import { ErrorLevel, MetaBindValidationError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { stringifyUnknown } from 'packages/core/src/utils/Literal';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID, toArray } from 'packages/core/src/utils/Utils';
import { mount, unmount } from 'svelte';

export class LinkVF extends AbstractViewField<MarkdownLink | MarkdownLink[] | undefined> {
	component?: ReturnType<typeof LinkListComponent>;
	linkVariable?: ViewFieldVariable;
	aliasVariable?: ViewFieldVariable | string;

	constructor(mountable: ViewFieldMountable) {
		super(mountable);
	}

	protected buildVariables(): void {
		// filter out empty strings
		const entries: (string | BindTargetDeclaration)[] = this.mountable
			.getDeclaration()
			.templateDeclaration.filter(x => (typeof x === 'string' ? x : true));

		if (entries.length !== 1 && entries.length !== 2 && entries.length !== 3) {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'link view field must be of form "{bindTarget}" or "{bindTarget}|{bindTarget}"',
			});
		}

		const linkEntry = entries[0];
		const separatorEntry = entries[1];
		const linkTextEntry = entries[2];

		this.variables = [];

		if (entries.length === 1) {
			if (typeof linkEntry === 'string') {
				throw new MetaBindValidationError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not create view field',
					cause: 'link view field must be of form "{bindTarget}" or "{bindTarget}|{bindTarget}"',
				});
			}

			linkEntry.listenToChildren = true;

			this.linkVariable = {
				bindTargetDeclaration: linkEntry,
				metadataSignal: new Signal<unknown>(undefined),
				uuid: getUUID(),
				contextName: `MB_VAR_0`,
			};

			this.variables.push(this.linkVariable);
		} else if (entries.length === 2 || entries.length === 3) {
			if (typeof linkEntry === 'string' || typeof separatorEntry !== 'string') {
				throw new MetaBindValidationError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not create view field',
					cause: 'link view field must be of form "{bindTarget}", "{bindTarget}|alias", or "{bindTarget}|{bindTarget}"',
				});
			}

			linkEntry.listenToChildren = true;

			this.linkVariable = {
				bindTargetDeclaration: linkEntry,
				metadataSignal: new Signal<unknown>(undefined),
				uuid: getUUID(),
				contextName: `MB_VAR_0`,
			};

			this.variables.push(this.linkVariable);

			if (entries.length === 2) {
				this.aliasVariable = separatorEntry.slice(1);
			} else {
				if (typeof linkTextEntry === 'string') {
					this.aliasVariable = linkTextEntry;
				} else {
					linkTextEntry.listenToChildren = true;

					this.aliasVariable = {
						bindTargetDeclaration: linkTextEntry,
						metadataSignal: new Signal<unknown>(undefined),
						uuid: getUUID(),
						contextName: `MB_VAR_1`,
					};

					this.variables.push(this.aliasVariable);
				}
			}
		} else {
			throw new Error('unreachable');
		}
	}

	private getAlias(): string | undefined {
		if (!this.aliasVariable) {
			return undefined;
		}

		if (typeof this.aliasVariable === 'string') {
			return this.aliasVariable;
		} else {
			return stringifyUnknown(
				this.aliasVariable.metadataSignal.get(),
				this.mountable.plugin.settings.viewFieldDisplayNullAsEmpty,
			);
		}
	}

	protected computeValue(): MarkdownLink | MarkdownLink[] | undefined {
		const linkContent = this.linkVariable!.metadataSignal.get();
		const alias = this.getAlias();

		if (typeof linkContent === 'string') {
			const link = MDLinkParser.parseLink(linkContent);
			if (alias) {
				link.alias = alias;
			}
			return [link];
		} else if (Array.isArray(linkContent)) {
			return linkContent.filter(x => typeof x === 'string').map(x => MDLinkParser.parseLink(x));
		} else {
			return undefined;
		}
	}

	protected mapValue(value: MarkdownLink | MarkdownLink[] | undefined): unknown {
		if (value === undefined) {
			return '';
		} else if (Array.isArray(value)) {
			return value.map(x => x.toString());
		} else {
			return value.toString();
		}
	}

	protected onInitialRender(container: HTMLElement): void {
		this.component = mount(LinkListComponent, {
			target: container,
			props: {
				mdLinkList: [],
			},
		});
	}

	protected async onRerender(_: HTMLElement, value: MarkdownLink | MarkdownLink[] | undefined): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.component?.updateList(toArray(value));
	}

	protected onUnmount(): void {
		super.onUnmount();

		if (this.component) {
			void unmount(this.component);
		}
	}
}
