import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import ImageGrid from 'packages/core/src/utils/components/ImageGrid.svelte';
import { ErrorLevel, MetaBindValidationError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ImageVF extends AbstractViewField<string> {
	component?: ReturnType<SvelteComponent>;
	linkVariable?: ViewFieldVariable;

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

		const linkEntry = entries[0];
		if (typeof linkEntry === 'string') {
			throw new MetaBindValidationError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create view field',
				cause: 'image view filed only supports exactly a single bind target and not text content',
			});
		}

		linkEntry.listenToChildren = true;

		this.linkVariable = {
			bindTargetDeclaration: linkEntry,
			inputSignal: new Signal<unknown>(undefined),
			uuid: getUUID(),
			contextName: `MB_VAR_0`,
		};

		this.variables.push(this.linkVariable);
	}

	protected computeValue(): string {
		const linkContent = this.linkVariable!.inputSignal.get();

		// we want the return value to be a human-readable string, since someone could save this to the frontmatter
		if (typeof linkContent === 'string') {
			return MDLinkParser.toLinkString(linkContent);
		} else if (Array.isArray(linkContent)) {
			const strings = linkContent.filter(x => typeof x === 'string');
			return strings
				.map(x => MDLinkParser.toLinkString(x))
				.filter(x => x !== '')
				.join(', ');
		} else {
			return '';
		}
	}

	protected onInitialRender(container: HTMLElement): void {
		this.component = mount(ImageGrid, {
			target: container,
			props: {
				images: [],
				plugin: this.mountable.plugin,
			},
		});
	}

	protected async onRerender(container: HTMLElement, value: string | undefined): Promise<void> {
		const linkList = value ? MDLinkParser.parseLinkList(value) : [];
		if (this.component) {
			void unmount(this.component);
		}
		this.component = mount(ImageGrid, {
			target: container,
			props: {
				images: linkList.map(x => ({ link: x.target, internal: x.internal })),
				plugin: this.mountable.plugin,
			},
		});
	}

	protected onUnmount(): void {
		super.onUnmount();

		if (this.component) {
			void unmount(this.component);
		}
	}
}
