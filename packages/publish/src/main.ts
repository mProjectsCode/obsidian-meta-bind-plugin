import { type MarkdownPostProcessorContext } from 'obsidian/publish';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { type MetaBindPluginSettings } from 'packages/core/src/Settings';
import { GlobalMetadataSource, InternalMetadataSource } from 'packages/core/src/metadata/InternalMetadataSources';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { BindTargetStorageType } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { PublishAPI } from 'packages/publish/src/PublishAPI';
import { PublishInternalAPI } from 'packages/publish/src/PublishInternalAPI';

export class MetaBindPublishPlugin implements IPlugin {
	settings: MetaBindPluginSettings;
	api: PublishAPI;
	internal: PublishInternalAPI;
	metadataManager: MetadataManager;

	constructor(settings: MetaBindPluginSettings) {
		this.settings = settings;

		this.api = new PublishAPI(this);
		this.internal = new PublishInternalAPI(this);
		this.metadataManager = new MetadataManager();
		this.setUpMetadataManager();

		this.load();
	}

	setUpMetadataManager(): void {
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.FRONTMATTER, this.metadataManager),
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

		console.log(publish);

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

				const base = this.api.createInlineFieldOfTypeFromString(fieldType, content, filePath, undefined);
				const mdrc = this.api.wrapInMDRC(base, codeBlock, ctx);

				mdrc.load();
			}
		}, 1);
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
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
new MetaBindPublishPlugin(mb_settings);
