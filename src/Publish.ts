import { AbstractPlugin } from './AbstractPlugin';
import { MDRCManager } from './MDRCManager';
import { PublishMetadataManager } from './metadata/PublishMetadataManager';
import { MetaBindPluginSettings } from './settings/Settings';
import { API } from './api/API';
import { InputFieldDeclaration } from './parsers/InputFieldDeclarationParser';
import { InputFieldMDRC, RenderChildType } from './renderChildren/InputFieldMDRC';
import { ViewFieldDeclaration } from './parsers/ViewFieldDeclarationParser';
import { ViewFieldMDRC } from './renderChildren/ViewFieldMDRC';

export class MetaBindPublishPlugin implements AbstractPlugin {
	mdrcManager: MDRCManager;
	metadataManager: PublishMetadataManager;
	settings: MetaBindPluginSettings;
	api: API;

	constructor(settings: MetaBindPluginSettings) {
		this.settings = settings;

		this.api = new API(this);
		this.mdrcManager = new MDRCManager();
		this.metadataManager = new PublishMetadataManager(this);

		this.load();
	}

	onLoad() {
		console.log('meta-bind-publish | loaded');

		publish.registerMarkdownPostProcessor((el, ctx) => {
			const codeBlocks = el.querySelectorAll('code');
			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);
				const fullDeclaration = codeBlock.innerText;
				const isInputField = fullDeclaration.startsWith('INPUT[') && fullDeclaration.endsWith(']');
				const isViewField = fullDeclaration.startsWith('VIEW[') && fullDeclaration.endsWith(']');

				if (isInputField) {
					console.log('meta-bind-publish | input field', fullDeclaration);
					const declaration: InputFieldDeclaration = this.api.inputFieldParser.parseString(fullDeclaration);
					ctx.addChild(new InputFieldMDRC(el, RenderChildType.INLINE, declaration, this, ctx.sourcePath, self.crypto.randomUUID()));
				}
				if (isViewField) {
					const declaration: ViewFieldDeclaration = this.api.viewFieldParser.parseString(fullDeclaration);
					ctx.addChild(new ViewFieldMDRC(el, RenderChildType.INLINE, declaration, this, ctx.sourcePath, self.crypto.randomUUID()));
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
