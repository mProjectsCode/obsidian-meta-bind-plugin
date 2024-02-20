import { type MarkdownPostProcessorContext } from 'obsidian/publish';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { type MetaBindPluginSettings } from 'packages/core/src/Settings';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
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
				const mdrcType = this.api.isInlineFieldDeclarationAndGetType(content);

				console.log(content, mdrcType);
				if (mdrcType === undefined) {
					continue;
				}
				// console.log(content, ctx.getSectionInfo(codeBlock)?.lineStart, ctx.getSectionInfo(codeBlock)?.lineEnd);
				const mdrc = this.api.createMDRC(
					mdrcType,
					content,
					RenderChildType.INLINE,
					filePath,
					codeBlock,
					ctx,
					undefined,
				);
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

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
new MetaBindPublishPlugin(mb_settings);
