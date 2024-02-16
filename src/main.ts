import { loadPrism, type MarkdownPostProcessorContext, Plugin, stringifyYaml, type WorkspaceLeaf } from 'obsidian';
import { MetaBindSettingTab } from './settings/SettingsTab';
import { DateParser } from './parsers/DateParser';
import { MetadataManager } from './metadata/MetadataManager';
import { ObsidianAPI } from './api/ObsidianAPI';
import { setFirstWeekday } from './utils/DatePickerUtils';
import { createMarkdownRenderChildWidgetEditorPlugin } from './cm6/Cm6_ViewPlugin';
import { MDRCManager } from './MDRCManager';
import { DEFAULT_SETTINGS, type MetaBindPluginSettings } from './settings/Settings';
import { type IPlugin } from './IPlugin';
import { FaqView, MB_FAQ_VIEW_TYPE } from './faq/FaqView';
import { EMBED_MAX_DEPTH, EmbedMDRC } from './renderChildren/EmbedMDRC';
import { ObsidianInternalAPI } from './api/ObsidianInternalAPI';
import { RenderChildType } from './config/FieldConfigs';
import { ButtonBuilderModal } from './fields/button/ButtonBuilderModal';
import { MDRCWidgetUtils } from './cm6/MDRCWidgetUtils';
import { registerCm5HLModes } from './cm6/Cm5_Modes';
import { DependencyManager } from './utils/dependencies/DependencyManager';
import { Version } from './utils/dependencies/Version';
import { createEditorMenu } from './EditorMenu';
import { BindTargetStorageType } from './parsers/bindTargetParser/BindTargetDeclaration';
import { GlobalMetadataSource, InternalMetadataSource, ScopeMetadataSource } from './metadata/InternalMetadataSources';
import { ObsidianMetadataSource } from './metadata/ObsidianMetadataSource';
import { FieldType } from './api/API';

export enum MetaBindBuild {
	DEV = 'dev',
	CANARY = 'canary',
	RELEASE = 'release',
}

export default class MetaBindPlugin extends Plugin implements IPlugin {
	// @ts-expect-error TS2564
	settings: MetaBindPluginSettings;

	// @ts-expect-error TS2564
	mdrcManager: MDRCManager;

	// @ts-expect-error TS2564
	metadataManager: MetadataManager;

	// @ts-expect-error TS2564
	api: ObsidianAPI;

	// @ts-expect-error TS2564
	internal: ObsidianInternalAPI;

	// @ts-expect-error TS2564
	build: MetaBindBuild;

	// @ts-expect-error TS2564
	dependencyManager: DependencyManager;

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> load`);

		this.build = this.determineBuild();

		// settings
		await this.loadSettings();
		this.addSettingTab(new MetaBindSettingTab(this.app, this));

		// check dependencies
		this.dependencyManager = new DependencyManager(this, [
			{
				name: 'Dataview',
				pluginId: 'dataview',
				minVersion: new Version(0, 5, 64),
			},
			{
				name: 'JS Engine',
				pluginId: 'js-engine',
				minVersion: new Version(0, 1, 0),
			},
		]);
		if (this.dependencyManager.checkDependenciesOnStartup()) {
			return;
		}

		// create all APIs and managers
		this.api = new ObsidianAPI(this);
		this.internal = new ObsidianInternalAPI(this);
		this.mdrcManager = new MDRCManager();
		// const metadataAdapter = new ObsidianMetadataAdapter(this);

		this.setUpMetadataManager();

		this.loadTemplates();

		// register all post processors for MDRCs
		this.addPostProcessors();
		this.registerEditorExtension(createMarkdownRenderChildWidgetEditorPlugin(this));

		this.addCommands();
		registerCm5HLModes(this);

		// misc
		this.registerView(MB_FAQ_VIEW_TYPE, leaf => new FaqView(leaf, this));
		this.addStatusBarBuildIndicator();

		if (this.settings.enableEditorRightClickMenu) {
			this.registerEvent(
				this.app.workspace.on('editor-menu', (menu, editor) => {
					createEditorMenu(menu, editor, this);
				}),
			);
		}

		// we need to wait for prism to load first, otherwise prism will cause problems by highlighting things that it shouldn't
		await loadPrism();
	}

	onunload(): void {
		console.log(`meta-bind | Main >> unload`);
		this.mdrcManager.unload();
	}

	// TODO: move to internal API
	determineBuild(): MetaBindBuild {
		if (MB_GLOBAL_CONFIG_DEV_BUILD) {
			return MetaBindBuild.DEV;
		} else if (this.manifest.version.includes('canary')) {
			return MetaBindBuild.CANARY;
		} else {
			return MetaBindBuild.RELEASE;
		}
	}

	setUpMetadataManager(): void {
		this.metadataManager = new MetadataManager();
		this.metadataManager.registerSource(
			new ObsidianMetadataSource(this, BindTargetStorageType.FRONTMATTER, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new GlobalMetadataSource(BindTargetStorageType.GLOBAL_MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(new ScopeMetadataSource(BindTargetStorageType.SCOPE, this.metadataManager));
		this.metadataManager.setDefaultSource(BindTargetStorageType.FRONTMATTER);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				this.mdrcManager.unloadFile(oldPath);
				this.metadataManager.onStoragePathRenamed(oldPath, file.path);
			}),
		);

		this.registerEvent(
			this.app.vault.on('delete', file => {
				this.mdrcManager.unloadFile(file.path);
				this.metadataManager.onStoragePathDeleted(file.path);
			}),
		);

		this.registerInterval(window.setInterval(() => this.metadataManager.cycle(), this.settings.syncInterval));
	}

	addPostProcessors(): void {
		// inline code blocks
		this.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const codeBlocks = el.querySelectorAll('code');
			const filePath = ctx.sourcePath;

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('mb-none')) {
					continue;
				}

				const content = codeBlock.innerText;
				const mdrcType = MDRCWidgetUtils.isDeclarationAndGetMDRCType(content);
				if (mdrcType === undefined) {
					continue;
				}
				// console.log(content, ctx.getSectionInfo(codeBlock)?.lineStart, ctx.getSectionInfo(codeBlock)?.lineEnd);
				this.api.createMDRC(mdrcType, content, RenderChildType.INLINE, filePath, codeBlock, ctx, undefined);
			}
		}, 1);

		// "meta-bind" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.trim();
			const filePath = ctx.sourcePath;

			const mdrcType = MDRCWidgetUtils.isDeclarationAndGetMDRCType(content);
			if (mdrcType === undefined) {
				return;
			}

			this.api.createMDRC(mdrcType, content, RenderChildType.BLOCK, filePath, codeBlock, ctx, undefined);
		});

		// "meta-bind-js-view" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.trim();
			const filePath = ctx.sourcePath;

			this.api.createMDRC(
				FieldType.JS_VIEW_FIELD,
				content,
				RenderChildType.BLOCK,
				filePath,
				codeBlock,
				ctx,
				undefined,
			);
		});

		// "meta-bind-embed" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-embed', (source, el, ctx) => {
			const embed = new EmbedMDRC(this, ctx.sourcePath, el, source, 0);
			ctx.addChild(embed);
		});

		for (let i = 1; i <= EMBED_MAX_DEPTH; i++) {
			this.registerMarkdownCodeBlockProcessor(`meta-bind-embed-internal-${i}`, (source, el, ctx) => {
				const embed = new EmbedMDRC(this, ctx.sourcePath, el, source, i);
				ctx.addChild(embed);
			});
		}

		// "meta-bind-button" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-button', (source, el, ctx) => {
			console.log(ctx.getSectionInfo(el));
			this.api.createButtonFromString(source, ctx.sourcePath, el, ctx);
		});
	}

	addCommands(): void {
		this.addCommand({
			id: 'open-docs',
			name: 'Open Meta Bind Docs',
			callback: () => {
				window.open('https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/', '_blank');
			},
		});

		this.addCommand({
			id: 'open-faq',
			name: 'Open Meta Bind FAQ',
			callback: () => {
				void this.activateView(MB_FAQ_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: 'open-help',
			name: 'Open Meta Bind Help',
			callback: () => {
				void this.activateView(MB_FAQ_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: 'open-button-builder',
			name: 'Open Button Builder',
			callback: () => {
				new ButtonBuilderModal({
					plugin: this,
					onOkay: (config): void => {
						void window.navigator.clipboard.writeText(
							`\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``,
						);
					},
					submitText: 'Copy to Clipboard',
				}).open();
			},
		});
	}

	addStatusBarBuildIndicator(): void {
		if (this.build === MetaBindBuild.DEV) {
			const item = this.addStatusBarItem();
			item.setText('Meta Bind Dev Build');
			item.addClass('mb-error');
			this.register(() => item.remove());
		}

		if (this.build === MetaBindBuild.CANARY) {
			const item = this.addStatusBarItem();
			item.setText(`Meta Bind Canary Build (${this.manifest.version})`);
			item.addClass('mb-error');
			this.register(() => item.remove());
		}
	}

	loadTemplates(): void {
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

	// TODO: move to internal API
	isFilePathExcluded(path: string): boolean {
		for (const excludedFolder of this.settings.excludedFolders) {
			if (path.startsWith(excludedFolder)) {
				return true;
			}
		}

		return false;
	}

	async loadSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings load`);

		const loadedSettings = (await this.loadData()) as MetaBindPluginSettings;

		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);

		await this.saveSettings();
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		// update all the things
		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);

		await this.saveData(this.settings);
	}

	// TODO: move to internal API
	async activateView(viewType: string): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: viewType, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}
