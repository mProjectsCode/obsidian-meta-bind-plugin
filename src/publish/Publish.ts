import { MetaBindPluginSettings } from '../settings/Settings';
import { IPlugin } from '../IPlugin';
import { PublishAPI } from './PublishAPI';

export class MetaBindPublishPlugin implements IPlugin {
	settings: MetaBindPluginSettings;
	api: PublishAPI;

	constructor(settings: MetaBindPluginSettings) {
		this.settings = settings;

		this.api = new PublishAPI(this);

		this.load();
	}

	onLoad() {
		console.log('meta-bind-publish | loaded');

		console.log(publish);

		publish.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const fullDeclaration = codeBlock.innerText;
				const isInputField = fullDeclaration.startsWith('INPUT[') && fullDeclaration.endsWith(']');
				const isViewField = fullDeclaration.startsWith('VIEW[') && fullDeclaration.endsWith(']');

				if (isInputField) {
					this.api.createInputFieldFromString(fullDeclaration, ctx.sourcePath, ctx.frontmatter, codeBlock, ctx);
				}
				if (isViewField) {
					this.api.createViewFieldFromString(fullDeclaration, ctx.sourcePath, ctx.frontmatter, codeBlock, ctx);
				}
			}
		}, 100);
	}

	onUnload() {
		console.log('meta-bind-publish | unloaded');
	}

	load() {
		this.onLoad();
	}

	unload() {
		this.onUnload();
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}

// @ts-ignore
new MetaBindPublishPlugin(mb_settings);
