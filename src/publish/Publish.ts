import { type MetaBindPluginSettings } from '../settings/Settings';
import { type IPlugin } from '../IPlugin';
import { PublishAPI } from './PublishAPI';
import { type MarkdownPostProcessorContext } from 'obsidian/publish';

export class MetaBindPublishPlugin implements IPlugin {
	settings: MetaBindPluginSettings;
	api: PublishAPI;

	constructor(settings: MetaBindPluginSettings) {
		this.settings = settings;

		this.api = new PublishAPI(this);

		this.load();
	}

	onLoad(): void {
		console.log('meta-bind-publish | loaded');

		console.log(publish);

		publish.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const fullDeclaration = codeBlock.innerText;
				const isInputField = fullDeclaration.startsWith('INPUT[') && fullDeclaration.endsWith(']');
				const isViewField = fullDeclaration.startsWith('VIEW[') && fullDeclaration.endsWith(']');

				if (isInputField) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					this.api.createInputFieldFromString(fullDeclaration, ctx.sourcePath, ctx.frontmatter, codeBlock, ctx);
				}
				if (isViewField) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					this.api.createViewFieldFromString(fullDeclaration, ctx.sourcePath, ctx.frontmatter, codeBlock, ctx);
				}
			}
		}, 100);
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
