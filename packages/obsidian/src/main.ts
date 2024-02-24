import { loadPrism, type MarkdownPostProcessorContext, Plugin, stringifyYaml, type WorkspaceLeaf } from 'obsidian';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { DEFAULT_SETTINGS, type MetaBindPluginSettings } from 'packages/core/src/Settings';
import { EMBED_MAX_DEPTH } from 'packages/core/src/config/FieldConfigs';
import {
	GlobalMetadataSource,
	InternalMetadataSource,
	ScopeMetadataSource,
} from 'packages/core/src/metadata/InternalMetadataSources';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import { BindTargetStorageType } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { setFirstWeekday } from 'packages/core/src/utils/DatePickerUtils';
import { createEditorMenu } from 'packages/obsidian/src/EditorMenu';
import { MDRCManager } from 'packages/obsidian/src/MDRCManager';
import { ObsidianAPI } from 'packages/obsidian/src/ObsidianAPI';
import { ObsidianInternalAPI } from 'packages/obsidian/src/ObsidianInternalAPI';
import { ObsidianMetadataSource } from 'packages/obsidian/src/ObsidianMetadataSource';
import { registerCm5HLModes } from 'packages/obsidian/src/cm6/Cm5_Modes';
import { createMarkdownRenderChildWidgetEditorPlugin } from 'packages/obsidian/src/cm6/Cm6_ViewPlugin';
import { DependencyManager } from 'packages/obsidian/src/dependencies/DependencyManager';
import { Version } from 'packages/obsidian/src/dependencies/Version';
import { FaqView, MB_FAQ_VIEW_TYPE } from 'packages/obsidian/src/faq/FaqView';
import { MetaBindSettingTab } from 'packages/obsidian/src/settings/SettingsTab';

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
				const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
				if (fieldType === undefined) {
					continue;
				}
				// console.log(content, ctx.getSectionInfo(codeBlock)?.lineStart, ctx.getSectionInfo(codeBlock)?.lineEnd);
				this.api.createInlineMDRCOfTypeFromString(fieldType, content, undefined, filePath, codeBlock, ctx);
			}
		}, 1);

		// "meta-bind" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.trim();
			const filePath = ctx.sourcePath;

			const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
			if (fieldType === undefined) {
				return;
			}

			this.api.createInlineMDRCOfTypeFromString(fieldType, content, undefined, filePath, codeBlock, ctx);
		});

		// "meta-bind-js-view" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			const field = this.api.createJsViewFieldBase(ctx.sourcePath, {
				declaration: source,
			});

			this.api.wrapInMDRC(field, el, ctx);
		});

		// "meta-bind-embed" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-embed', (source, el, ctx) => {
			const field = this.api.createEmbedBase(ctx.sourcePath, {
				content: source,
				depth: 0,
			});

			this.api.wrapInMDRC(field, el, ctx);
		});

		for (let i = 1; i <= EMBED_MAX_DEPTH; i++) {
			this.registerMarkdownCodeBlockProcessor(`meta-bind-embed-internal-${i}`, (source, el, ctx) => {
				const field = this.api.createEmbedBase(ctx.sourcePath, {
					content: source,
					depth: i,
				});

				this.api.wrapInMDRC(field, el, ctx);
			});
		}

		// "meta-bind-button" code blocks
		this.registerMarkdownCodeBlockProcessor('meta-bind-button', (source, el, ctx) => {
			const field = this.api.createButtonBase(ctx.sourcePath, {
				declaration: source,
				isPreview: false,
			});

			this.api.wrapInMDRC(field, el, ctx);
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
				this.internal.openButtonBuilderModal({
					onOkay: (config): void => {
						void window.navigator.clipboard.writeText(
							`\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``,
						);
					},
					submitText: 'Copy to Clipboard',
				});
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
