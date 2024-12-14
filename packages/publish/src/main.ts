import type { MarkdownPostProcessorContext } from 'obsidian/publish';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import { EMBED_MAX_DEPTH } from 'packages/core/src/config/FieldConfigs';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { GlobalMetadataSource, InternalMetadataSource } from 'packages/core/src/metadata/InternalMetadataSources';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { MountableManager } from 'packages/core/src/MountableManager';
import { BindTargetStorageType } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import type { MetaBindPluginSettings } from 'packages/core/src/Settings';
import { setFirstWeekday } from 'packages/core/src/utils/DatePickerUtils';
import { PublishAPI } from 'packages/publish/src/PublishAPI';
import { PublishInternalAPI } from 'packages/publish/src/PublishInternalAPI';
import { PublishMetadataSource } from 'packages/publish/src/PublishMetadataSource';
import { PublishNotePosition } from 'packages/publish/src/PublishNotePosition';

export class MetaBindPublishPlugin implements IPlugin {
	settings: MetaBindPluginSettings;
	api: PublishAPI;
	internal: PublishInternalAPI;
	metadataManager: MetadataManager;
	mountableManager: MountableManager;

	constructor(settings: MetaBindPluginSettings) {
		this.settings = settings;

		this.api = new PublishAPI(this);
		this.internal = new PublishInternalAPI(this);
		this.metadataManager = new MetadataManager();
		this.setUpMetadataManager();

		this.mountableManager = new MountableManager();

		this.load();
	}

	setUpMetadataManager(): void {
		this.metadataManager.registerSource(
			new PublishMetadataSource(this, BindTargetStorageType.FRONTMATTER, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new GlobalMetadataSource(BindTargetStorageType.GLOBAL_MEMORY, this.metadataManager),
		);
		this.metadataManager.setDefaultSource(BindTargetStorageType.FRONTMATTER);

		window.setInterval(() => this.metadataManager.cycle(), this.settings.syncInterval);
	}

	onLoad(): void {
		console.log('meta-bind-publish | loaded');

		this.updateInternalSettings();

		publish.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const codeBlocks = el.querySelectorAll('code');
			const filePath = ctx.sourcePath;

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('mb-none')) {
					continue;
				}

				const content = codeBlock.innerText;
				const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
				if (fieldType === undefined) {
					continue;
				}

				const mountable = this.api.createInlineFieldOfTypeFromString(fieldType, content, filePath, undefined);
				const mdrc = this.api.wrapInMDRC(mountable, codeBlock, ctx);

				mdrc.load();
			}
		}, 1);

		// "meta-bind" code blocks
		publish.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.trim();
			const filePath = ctx.sourcePath;

			const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
			if (fieldType === undefined) {
				return;
			}

			const mountable = this.api.createInlineFieldOfTypeFromString(
				fieldType,
				content,
				filePath,
				undefined,
				RenderChildType.BLOCK,
				new PublishNotePosition(ctx, el),
			);
			const mdrc = this.api.wrapInMDRC(mountable, codeBlock, ctx);

			mdrc.load();
		});

		// "meta-bind-js-view" code blocks
		publish.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			const mountable = this.api.createJsViewFieldMountable(ctx.sourcePath, {
				declaration: source,
			});

			const mdrc = this.api.wrapInMDRC(mountable, el, ctx);

			mdrc.load();
		});

		// "meta-bind-embed" code blocks
		publish.registerMarkdownCodeBlockProcessor('meta-bind-embed', (source, el, ctx) => {
			const mountable = this.api.createEmbedMountable(ctx.sourcePath, {
				content: source,
				depth: 0,
			});

			const mdrc = this.api.wrapInMDRC(mountable, el, ctx);

			mdrc.load();
		});

		for (let i = 1; i <= EMBED_MAX_DEPTH; i++) {
			publish.registerMarkdownCodeBlockProcessor(`meta-bind-embed-internal-${i}`, (source, el, ctx) => {
				const mountable = this.api.createEmbedMountable(ctx.sourcePath, {
					content: source,
					depth: i,
				});

				const mdrc = this.api.wrapInMDRC(mountable, el, ctx);

				mdrc.load();
			});
		}

		// "meta-bind-button" code blocks
		publish.registerMarkdownCodeBlockProcessor('meta-bind-button', (source, el, ctx) => {
			const mountable = this.api.createButtonMountable(ctx.sourcePath, {
				declaration: source,
				isPreview: false,
				position: new PublishNotePosition(ctx, el),
			});

			const mdrc = this.api.wrapInMDRC(mountable, el, ctx);

			mdrc.load();
		});
	}

	onUnload(): void {
		console.log('meta-bind-publish | unloaded');
	}

	load(): void {
		this.onLoad();
	}

	unload(): void {
		this.onUnload();
	}

	updateInternalSettings(): void {
		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);

		this.loadTemplates();
	}

	loadTemplates(): void {
		if (!this.api) {
			return;
		}

		const inputFieldTemplateParseErrorCollection = this.api.inputFieldParser.parseTemplates(
			this.settings.inputFieldTemplates,
		);
		if (inputFieldTemplateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse input field templates', inputFieldTemplateParseErrorCollection);
		}

		const buttonTemplateParseErrorCollection = this.api.buttonManager.setButtonTemplates(
			this.settings.buttonTemplates,
		);
		if (buttonTemplateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse button templates', buttonTemplateParseErrorCollection);
		}
	}
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const mb = new MetaBindPublishPlugin(mb_settings);
// @ts-ignore

window.mb = mb;
