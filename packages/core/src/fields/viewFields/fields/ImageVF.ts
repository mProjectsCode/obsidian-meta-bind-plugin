import { AbstractViewField } from 'packages/core/src/fields/viewFields/AbstractViewField';
import type { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import type { ViewFieldVariable } from 'packages/core/src/fields/viewFields/ViewFieldVariable';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import ImageGrid from 'packages/core/src/utils/components/ImageGrid.svelte';
import { ErrorLevel, MetaBindValidationError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID, toArray } from 'packages/core/src/utils/Utils';
import { mount, unmount } from 'svelte';

export class ImageVF extends AbstractViewField<MarkdownLink | MarkdownLink[] | undefined> {
	component?: ReturnType<typeof ImageGrid>;
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
			metadataSignal: new Signal<unknown>(undefined),
			uuid: getUUID(),
			contextName: `MB_VAR_0`,
		};

		this.variables.push(this.linkVariable);
	}

	protected computeValue(): MarkdownLink | MarkdownLink[] | undefined {
		const linkContent = this.linkVariable!.metadataSignal.get();

		if (typeof linkContent === 'string') {
			const link = MDLinkParser.interpretAsLink(linkContent);
			if (link === undefined) {
				return undefined;
			}
			return [link];
		} else if (Array.isArray(linkContent)) {
			return linkContent
				.filter(x => typeof x === 'string')
				.map(x => MDLinkParser.interpretAsLink(x))
				.filter(x => x !== undefined);
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
		this.component = mount(ImageGrid, {
			target: container,
			props: {
				images: [],
				plugin: this.mountable.plugin,
			},
		});
	}

	protected async onRerender(_: HTMLElement, value: MarkdownLink | MarkdownLink[] | undefined): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.component?.updateImages(toArray(value).map(x => ({ link: x.target, internal: x.internal })));
	}

	protected onUnmount(): void {
		super.onUnmount();

		if (this.component) {
			void unmount(this.component);
		}
	}
}
